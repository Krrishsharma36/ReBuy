import { ReBuyActivity, ReBuyDBError } from '../../types';
import { ReBuyDBManager } from '../db';

export class ActivityRepository {
  private dbManager = ReBuyDBManager.getInstance();

  /**
   * Retrieves a single activity document by ID.
   */
  public async get(id: string): Promise<ReBuyActivity | null> {
    const { store } = await this.dbManager.getStoreTransaction('activities', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new ReBuyDBError(`Failed to get activity with id: ${id}`, 'ACTIVITY_GET_FAILED', request.error));
    });
  }

  /**
   * Saves or overrides an activity document.
   */
  public async save(activity: ReBuyActivity): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('activities', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(activity);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to save activity with id: ${activity.id}`, 'ACTIVITY_SAVE_FAILED', request.error));
    });
  }

  /**
   * Deletes an activity document by ID.
   */
  public async delete(id: string): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('activities', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to delete activity with id: ${id}`, 'ACTIVITY_DELETE_FAILED', request.error));
    });
  }

  /**
   * Retrieves all activities associated with a parent ReBuyObject.
   * Sorted in reverse chronological order (newest activities first) using key matching.
   */
  public async getByObjectId(objectId: string): Promise<ReBuyActivity[]> {
    const { store } = await this.dbManager.getStoreTransaction('activities', 'readonly');
    const index = store.index('objectId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(objectId);
      request.onsuccess = () => {
        const list = request.result as ReBuyActivity[];
        // Sort descending by date
        resolve(list.sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()));
      };
      request.onerror = () => reject(new ReBuyDBError(`Failed to fetch activities for object: ${objectId}`, 'ACTIVITY_GET_BY_OBJECT_FAILED', request.error));
    });
  }

  /**
   * Retrieves all activities across the database.
   */
  public async getAll(includeArchived: boolean = false): Promise<ReBuyActivity[]> {
    const { store } = await this.dbManager.getStoreTransaction('activities', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const list = request.result as ReBuyActivity[];
        if (includeArchived) {
          resolve(list);
        } else {
          resolve(list.filter(item => !item.isArchived));
        }
      };
      request.onerror = () => reject(new ReBuyDBError('Failed to fetch all activities', 'ACTIVITY_GET_ALL_FAILED', request.error));
    });
  }
}
