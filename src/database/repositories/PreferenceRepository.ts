import { PreferenceItem, ReBuyDBError } from '../../types';
import { ReBuyDBManager } from '../db';

export class PreferenceRepository {
  private dbManager = ReBuyDBManager.getInstance();

  /**
   * Retrieves a preference setting value.
   */
  public async get<T>(key: string, defaultValue: T): Promise<T> {
    const { store } = await this.dbManager.getStoreTransaction('preferences', 'readonly');
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as PreferenceItem | undefined;
        if (result !== undefined) {
          resolve(result.value as T);
        } else {
          resolve(defaultValue);
        }
      };
      request.onerror = () => {
        // Return default fallback in case of errors to avoid locking the UI
        resolve(defaultValue);
      };
    });
  }

  /**
   * Saves or overrides a preference key value.
   */
  public async set<T>(key: string, value: T): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('preferences', 'readwrite');
    return new Promise((resolve, reject) => {
      const item: PreferenceItem = { key, value };
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to save preference: ${key}`, 'PREFERENCE_SET_FAILED', request.error));
    });
  }
}
