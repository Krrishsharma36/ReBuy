import { ReBuyDBError } from '../types';

const DB_NAME = 'ReBuyDB';
const DB_VERSION = 1;

export class ReBuyDBManager {
  private static instance: ReBuyDBManager;
  private db: IDBDatabase | null = null;

  private constructor() {}

  public static getInstance(): ReBuyDBManager {
    if (!ReBuyDBManager.instance) {
      ReBuyDBManager.instance = new ReBuyDBManager();
    }
    return ReBuyDBManager.instance;
  }

  public async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.initialize();
  }

  /**
   * Opens IndexedDB connection and runs schema structure upgrades.
   */
  public async initialize(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new ReBuyDBError('Failed to open database ReBuyDB', 'DB_OPEN_FAILED', request.error));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const oldVersion = event.oldVersion;

        console.log(`[ReBuyDB] Upgrading schema from version ${oldVersion} to ${DB_VERSION}`);

        if (oldVersion < 1) {
          // 1. Objects Store
          const objectsStore = db.createObjectStore('objects', { keyPath: 'id' });
          objectsStore.createIndex('name', 'name', { unique: false });
          objectsStore.createIndex('normalizedName', 'normalizedName', { unique: false });
          objectsStore.createIndex('type', 'type', { unique: false });
          objectsStore.createIndex('brand', 'brand', { unique: false });
          objectsStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          objectsStore.createIndex('lastActivityDate', 'lastActivityDate', { unique: false });
          objectsStore.createIndex('isArchived', 'isArchived', { unique: false });

          // 2. Activities Store
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id' });
          activitiesStore.createIndex('objectId', 'objectId', { unique: false });
          activitiesStore.createIndex('activityType', 'activityType', { unique: false });
          activitiesStore.createIndex('activityDate', 'activityDate', { unique: false });
          activitiesStore.createIndex('shop', 'shop', { unique: false });
          activitiesStore.createIndex('isArchived', 'isArchived', { unique: false });

          // 3. Preferences Store (Key-Value)
          db.createObjectStore('preferences', { keyPath: 'key' });

          // 4. Metadata Store (Key-Value)
          db.createObjectStore('metadata', { keyPath: 'key' });

          // 5. SearchIndex Store
          const searchIndexStore = db.createObjectStore('searchIndex', { keyPath: 'id' });
          searchIndexStore.createIndex('objectId', 'objectId', { unique: false });
          searchIndexStore.createIndex('token', 'token', { unique: false, multiEntry: true });
        }
      };
    });
  }

  /**
   * Helper to retrieve a store handle inside an isolated transaction.
   */
  public async getStoreTransaction(
    storeName: 'objects' | 'activities' | 'preferences' | 'metadata' | 'searchIndex',
    mode: IDBTransactionMode = 'readonly'
  ): Promise<{ transaction: IDBTransaction; store: IDBObjectStore }> {
    const db = await this.getDB();
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    return { transaction, store };
  }
}
export { DB_NAME, DB_VERSION };
