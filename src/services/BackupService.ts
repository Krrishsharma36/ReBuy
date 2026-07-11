import { ReBuyObject, ReBuyActivity, PreferenceItem, MetadataItem, ReBuyDBError } from '../types';
import { ObjectRepository } from '../database/repositories/ObjectRepository';
import { ActivityRepository } from '../database/repositories/ActivityRepository';
import { PreferenceRepository } from '../database/repositories/PreferenceRepository';
import { MetadataRepository } from '../database/repositories/MetadataRepository';
import { ReBuyDBManager } from '../database/db';

export interface BackupData {
  version: number;
  exportedAt: string;
  objects: ReBuyObject[];
  activities: ReBuyActivity[];
  preferences: PreferenceItem[];
  metadata: MetadataItem[];
}

export class BackupService {
  private objectRepo = new ObjectRepository();
  private activityRepo = new ActivityRepository();
  private prefRepo = new PreferenceRepository();
  private metaRepo = new MetadataRepository();
  private dbManager = ReBuyDBManager.getInstance();

  /**
   * Generates a complete JSON backup of the client datastore.
   */
  public async exportData(): Promise<string> {
    const objects = await this.objectRepo.getAll(true);
    const activities = await this.activityRepo.getAll(true);

    // Fetch preferences manually from store transaction
    const prefs: PreferenceItem[] = await this.getAllFromStore('preferences');
    const meta: MetadataItem[] = await this.getAllFromStore('metadata');

    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      objects,
      activities,
      preferences: prefs,
      metadata: meta
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restores database content from a JSON backup.
   * Options:
   *  - 'overwrite': Wipes existing stores first.
   *  - 'merge': Overwrites only if backup records are newer or do not exist locally.
   */
  public async importData(jsonData: string, strategy: 'overwrite' | 'merge'): Promise<void> {
    try {
      const backup = JSON.parse(jsonData) as BackupData;
      if (!backup.objects || !backup.activities) {
        throw new ReBuyDBError('Invalid backup file schema structure', 'INVALID_BACKUP_SCHEMA');
      }

      if (strategy === 'overwrite') {
        await this.clearAllStores();
        
        // Write all objects
        for (const obj of backup.objects) {
          await this.objectRepo.save(obj);
        }
        // Write all activities
        for (const act of backup.activities) {
          await this.activityRepo.save(act);
        }
        // Write all preferences
        for (const pref of backup.preferences || []) {
          await this.prefRepo.set(pref.key, pref.value);
        }
        // Write all metadata
        for (const metadata of backup.metadata || []) {
          await this.metaRepo.set(metadata.key, metadata.value);
        }
      } else {
        // Strategy: Merge
        // 1. Merge Objects
        for (const backupObj of backup.objects) {
          const localObj = await this.objectRepo.get(backupObj.id);
          if (!localObj || new Date(backupObj.updatedAt).getTime() > new Date(localObj.updatedAt).getTime()) {
            await this.objectRepo.save(backupObj);
          }
        }
        // 2. Merge Activities
        for (const backupAct of backup.activities) {
          const localAct = await this.activityRepo.get(backupAct.id);
          if (!localAct || new Date(backupAct.updatedAt).getTime() > new Date(localAct.updatedAt).getTime()) {
            await this.activityRepo.save(backupAct);
          }
        }
        // 3. Merge Preferences
        for (const pref of backup.preferences || []) {
          await this.prefRepo.set(pref.key, pref.value);
        }
      }

      // Track Last Restore date
      await this.metaRepo.set('last_restore_timestamp', new Date().toISOString());
    } catch (e: any) {
      if (e instanceof ReBuyDBError) throw e;
      throw new ReBuyDBError('Failed to parse backup JSON import', 'BACKUP_PARSE_ERROR', e);
    }
  }

  private async clearAllStores(): Promise<void> {
    const stores: ('objects' | 'activities' | 'preferences' | 'metadata' | 'searchIndex')[] = [
      'objects',
      'activities',
      'preferences',
      'metadata',
      'searchIndex'
    ];

    for (const storeName of stores) {
      const { store } = await this.dbManager.getStoreTransaction(storeName, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  private async getAllFromStore<T>(storeName: 'preferences' | 'metadata'): Promise<T[]> {
    const { store } = await this.dbManager.getStoreTransaction(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }
}
export { BackupService as ImportService }; // Re-export as ImportService if required
