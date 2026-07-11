import { MetadataItem, ReBuyDBError } from '../../types';
import { ReBuyDBManager } from '../db';

export class MetadataRepository {
  private dbManager = ReBuyDBManager.getInstance();

  /**
   * Retrieves a database metadata value.
   */
  public async get<T>(key: string, defaultValue: T): Promise<T> {
    const { store } = await this.dbManager.getStoreTransaction('metadata', 'readonly');
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as MetadataItem | undefined;
        if (result !== undefined) {
          resolve(result.value as T);
        } else {
          resolve(defaultValue);
        }
      };
      request.onerror = () => {
        resolve(defaultValue);
      };
    });
  }

  /**
   * Sets or overrides a metadata key value.
   */
  public async set<T>(key: string, value: T): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('metadata', 'readwrite');
    return new Promise((resolve, reject) => {
      const item: MetadataItem = { key, value };
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to set database metadata: ${key}`, 'METADATA_SET_FAILED', request.error));
    });
  }
}
