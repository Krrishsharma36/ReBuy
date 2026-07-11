import { ReBuyObject, ReBuyDBError } from '../../types';
import { ReBuyDBManager } from '../db';

export class ObjectRepository {
  private dbManager = ReBuyDBManager.getInstance();

  /**
   * Retrieves an object document by ID.
   */
  public async get(id: string): Promise<ReBuyObject | null> {
    const { store } = await this.dbManager.getStoreTransaction('objects', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new ReBuyDBError(`Failed to get object with id: ${id}`, 'OBJECT_GET_FAILED', request.error));
    });
  }

  /**
   * Saves or overrides an object document.
   */
  public async save(object: ReBuyObject): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('objects', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(object);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to save object with id: ${object.id}`, 'OBJECT_SAVE_FAILED', request.error));
    });
  }

  /**
   * Deletes an object document by ID.
   */
  public async delete(id: string): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('objects', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to delete object with id: ${id}`, 'OBJECT_DELETE_FAILED', request.error));
    });
  }

  /**
   * Retrieves all non-archived objects by default.
   */
  public async getAll(includeArchived: boolean = false): Promise<ReBuyObject[]> {
    const { store } = await this.dbManager.getStoreTransaction('objects', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const list = request.result as ReBuyObject[];
        if (includeArchived) {
          resolve(list);
        } else {
          resolve(list.filter(item => !item.isArchived));
        }
      };
      request.onerror = () => reject(new ReBuyDBError('Failed to fetch all objects', 'OBJECT_GET_ALL_FAILED', request.error));
    });
  }

  /**
   * Queries objects containing a specific tag using multiEntry index.
   */
  public async getByTag(tag: string): Promise<ReBuyObject[]> {
    const { store } = await this.dbManager.getStoreTransaction('objects', 'readonly');
    const index = store.index('tags');
    return new Promise((resolve, reject) => {
      const request = index.getAll(tag);
      request.onsuccess = () => {
        const list = request.result as ReBuyObject[];
        resolve(list.filter(item => !item.isArchived));
      };
      request.onerror = () => reject(new ReBuyDBError(`Failed to fetch objects with tag: ${tag}`, 'OBJECT_GET_BY_TAG_FAILED', request.error));
    });
  }
}
