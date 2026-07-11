import { ObjectRepository } from '../database/repositories/ObjectRepository';
import { ActivityRepository } from '../database/repositories/ActivityRepository';
import { SearchService } from '../services/SearchService';
import { DuplicateDetector } from './DuplicateDetector';
import { SmartDefaults } from './SmartDefaults';
import { LearningEngine } from './LearningEngine';
import { InputAnalyzer, AnalyzedInput } from './InputAnalyzer';
import { ReBuyObject, ReBuyActivity } from '../types';

export interface CapturePreview {
  analyzed: AnalyzedInput;
  matchedObject: ReBuyObject | null;
  duplicateWarning: ReBuyActivity | null;
  actionRequired: 'create' | 'append' | 'review';
}

export class CaptureEngine {
  private objectRepo = new ObjectRepository();
  private activityRepo = new ActivityRepository();
  private searchService = new SearchService();

  /**
   * Pre-evaluates raw input to detect matching objects, default parameters,
   * and duplicate warnings before executing writes.
   */
  public async prepare(inputText: string): Promise<CapturePreview> {
    // Fetch all objects for matching lookup
    const allObjects = await this.objectRepo.getAll(true);
    const objectNames = allObjects.map(o => o.name);
    const shopNames = allObjects.map(o => o.defaultShop).filter((v): v is string => !!v);
    const contactNames = allObjects.map(o => o.defaultContact).filter((v): v is string => !!v);

    // 1. Analyze text structure
    const analyzed = InputAnalyzer.analyze(inputText, objectNames, shopNames, contactNames);

    // 2. Resolve target object match
    let matchedObject: ReBuyObject | null = null;
    if (analyzed.matchedObjectName) {
      // Find matching object using fuzzy Levenshtein rules
      matchedObject = this.fuzzyMatchObject(analyzed.matchedObjectName, allObjects);
    }

    // 3. Apply historical defaults if matched
    let finalizedAnalysis = analyzed;
    if (matchedObject) {
      finalizedAnalysis = SmartDefaults.apply(analyzed, matchedObject);
    }

    // 4. Run Duplicate Check
    let duplicateWarning: ReBuyActivity | null = null;
    if (matchedObject && finalizedAnalysis.amount !== undefined) {
      const activities = await this.activityRepo.getByObjectId(matchedObject.id);
      const tempActivity: Partial<ReBuyActivity> = {
        objectId: matchedObject.id,
        activityType: (finalizedAnalysis.tags.includes('service') || finalizedAnalysis.tags.includes('repair')) ? 'service' : 'purchase',
        amount: finalizedAnalysis.amount,
        activityDate: finalizedAnalysis.date || new Date().toISOString()
      };
      duplicateWarning = DuplicateDetector.check(tempActivity, activities);
    }

    const actionRequired = matchedObject ? 'append' : 'create';

    return {
      analyzed: finalizedAnalysis,
      matchedObject,
      duplicateWarning,
      actionRequired
    };
  }

  /**
   * Commits the analyzed memory package to ReBuyDB.
   */
  public async commit(analyzed: AnalyzedInput, matchedObject: ReBuyObject | null): Promise<{ object: ReBuyObject; activity: ReBuyActivity }> {
    let objectRecord = matchedObject;

    const generateId = () => Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();

    // 1. Resolve / Create Object document
    if (!objectRecord) {
      const name = analyzed.matchedObjectName || 'Untitled Purchase';
      objectRecord = {
        id: generateId(),
        name,
        normalizedName: name.toLowerCase(),
        type: analyzed.tags.includes('service') ? 'service' : 'purchase',
        brand: analyzed.brand,
        variant: analyzed.remarks,
        defaultQuantity: analyzed.quantity || 1,
        defaultUnit: analyzed.unit || 'unit',
        defaultShop: analyzed.shop,
        defaultContact: analyzed.contact,
        tags: analyzed.tags,
        purchaseCount: 0,
        favoriteScore: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        isArchived: false
      };
    } else {
      // If object exists, increment its favoriteScore/rank
      objectRecord.favoriteScore = (objectRecord.favoriteScore || 0) + 1;
      objectRecord.updatedAt = timestamp;
    }

    // Save object
    await this.objectRepo.save(objectRecord);
    // Index object
    await this.searchService.indexObject(objectRecord);

    // 2. Create and Save Activity document
    const activityRecord: ReBuyActivity = {
      id: generateId(),
      objectId: objectRecord.id,
      activityType: (analyzed.tags.includes('service') || analyzed.tags.includes('repair')) ? 'service' : 'purchase',
      amount: analyzed.amount || 0,
      quantity: analyzed.quantity || objectRecord.defaultQuantity || 1,
      unit: analyzed.unit || objectRecord.defaultUnit || 'unit',
      shop: analyzed.shop || objectRecord.defaultShop,
      contact: analyzed.contact || objectRecord.defaultContact,
      remarks: analyzed.remarks,
      activityDate: analyzed.date || timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      isArchived: false
    };

    await this.activityRepo.save(activityRecord);

    // 3. Trigger Learning Engine to adjust default properties
    const allActivities = await this.activityRepo.getByObjectId(objectRecord.id);
    objectRecord = LearningEngine.learn(objectRecord, allActivities);
    
    // Cache statistics properties
    objectRecord.purchaseCount = allActivities.length;
    objectRecord.lastAmount = activityRecord.amount;
    objectRecord.lastActivityDate = activityRecord.activityDate;
    await this.objectRepo.save(objectRecord);

    return {
      object: objectRecord,
      activity: activityRecord
    };
  }

  private fuzzyMatchObject(name: string, objects: ReBuyObject[]): ReBuyObject | null {
    // Exact match check first
    const exact = objects.find(o => o.name.toLowerCase() === name.toLowerCase());
    if (exact) return exact;

    // Fallback to fuzzy Levenshtein evaluator
    const normalized = name.toLowerCase().trim();
    let bestMatch: ReBuyObject | null = null;
    let highestScore = 0;

    for (const obj of objects) {
      const objName = obj.name.toLowerCase().trim();
      let score = 0;
      if (objName.startsWith(normalized) || normalized.startsWith(objName)) score += 50;
      if (objName.includes(normalized) || normalized.includes(objName)) score += 30;
      
      const dist = this.levenshtein(objName, normalized);
      if (dist <= 2) score += 40 - (dist * 15);

      if (score > highestScore && score >= 20) {
        highestScore = score;
        bestMatch = obj;
      }
    }

    return bestMatch;
  }

  private levenshtein(a: string, b: string): number {
    const tmp: number[][] = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = a[i - 1] === b[j - 1] 
          ? tmp[i - 1][j - 1] 
          : Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + 1);
      }
    }
    return tmp[a.length][b.length];
  }
}
