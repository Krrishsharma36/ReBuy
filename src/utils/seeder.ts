import { ReBuyObject, ReBuyActivity } from '../types';
import { ObjectRepository } from '../database/repositories/ObjectRepository';
import { ActivityRepository } from '../database/repositories/ActivityRepository';
import { SearchService } from '../services/SearchService';

const SAMPLE_NAMES = [
  'Milk', 'Honda Activa', 'LG AC', 'Electrician', 'Doctor', 'Pressure Cooker',
  'iPhone', 'MacBook Air', 'Gym Membership', 'Dentist', 'Car Insurance',
  'Oil Change', 'Costco Grocery', 'Netflix Subscription', 'Starbucks Latte',
  'Running Shoes', 'Water Bill', 'Electricity Bill', 'Haircut', 'Dog Food'
];

const SAMPLE_BRANDS = [
  'Horizon Organic', 'Honda', 'LG Electronics', 'Apple', 'Costco Kirkland',
  'Netflix Inc.', 'Starbucks', 'Nike', 'Nestle', 'Purina'
];

const SAMPLE_SHOPS = [
  'Whole Foods', 'Honda Service Center', 'Best Buy', 'PepBoys', 'Local Clinic',
  'Starbucks Coffee', 'Costco Wholesale', 'App Store', 'Target', 'Supercuts'
];

const SAMPLE_TAGS = ['grocery', 'auto', 'home', 'subs', 'health', 'tech', 'fitness', 'utility'];

export class DatabaseSeeder {
  private static objectRepo = new ObjectRepository();
  private static activityRepo = new ActivityRepository();
  private static searchService = new SearchService();

  /**
   * Helper to generate a unique random ID string.
   */
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  /**
   * Seeds a configurable count of objects and activities into ReBuyDB.
   */
  public static async seed(objectCount: number = 20, activitiesPerObject: number = 3): Promise<{ objectsSeeded: number; activitiesSeeded: number; durationMs: number }> {
    const startTime = performance.now();
    let objectsSeeded = 0;
    let activitiesSeeded = 0;

    for (let i = 0; i < objectCount; i++) {
      const objId = this.generateId();
      const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)] + ' ' + (i + 1);
      const brand = SAMPLE_BRANDS[Math.floor(Math.random() * SAMPLE_BRANDS.length)];
      const defaultShop = SAMPLE_SHOPS[Math.floor(Math.random() * SAMPLE_SHOPS.length)];
      const tags = [
        SAMPLE_TAGS[Math.floor(Math.random() * SAMPLE_TAGS.length)],
        SAMPLE_TAGS[Math.floor(Math.random() * SAMPLE_TAGS.length)]
      ].filter((v, idx, self) => self.indexOf(v) === idx); // deduplicate tags

      const objectRecord: ReBuyObject = {
        id: objId,
        name,
        normalizedName: name.toLowerCase(),
        type: Math.random() > 0.3 ? 'purchase' : 'service',
        brand,
        variant: `Variant ${i + 1}`,
        defaultQuantity: Math.floor(Math.random() * 3) + 1,
        defaultUnit: 'unit',
        defaultShop,
        tags,
        purchaseCount: 0,
        favoriteScore: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false
      };

      await this.objectRepo.save(objectRecord);
      await this.searchService.indexObject(objectRecord);
      objectsSeeded++;

      // Create activities for this object
      for (let j = 0; j < activitiesPerObject; j++) {
        const actId = this.generateId();
        const amount = parseFloat((Math.random() * 120 + 5).toFixed(2));
        const activityDate = new Date(
          Date.now() - (j * 15 + Math.random() * 10) * 24 * 60 * 60 * 1000
        ).toISOString();

        const activityRecord: ReBuyActivity = {
          id: actId,
          objectId: objId,
          activityType: Math.random() > 0.4 ? 'purchase' : 'service',
          amount,
          quantity: objectRecord.defaultQuantity || 1,
          unit: objectRecord.defaultUnit,
          shop: objectRecord.defaultShop,
          activityDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false
        };

        await this.activityRepo.save(activityRecord);
        activitiesSeeded++;
      }

      // Re-fetch and update object statistics cache values
      const activities = await this.activityRepo.getByObjectId(objId);
      if (activities.length > 0) {
        objectRecord.purchaseCount = activities.length;
        objectRecord.lastAmount = activities[0].amount;
        objectRecord.lastActivityDate = activities[0].activityDate;
        await this.objectRepo.save(objectRecord);
      }
    }

    const durationMs = Math.round(performance.now() - startTime);
    return {
      objectsSeeded,
      activitiesSeeded,
      durationMs
    };
  }
}
