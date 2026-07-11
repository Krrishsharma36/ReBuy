export interface ParsedMemoryData {
  price?: number;
  currency?: string;
  merchant?: string;
  category?: string;
  tags: string[];
  date?: Date;
  rawParsedValues: Record<string, any>;
}

export interface Memory {
  id: string; // UUID or unique timestamp key
  rawText: string; // The original captured line (e.g. "Oil change $65 @ PepBoys #auto")
  parsedData: ParsedMemoryData;
  createdAt: Date;
  updatedAt: Date;
  nextReminderDate?: Date; // For recurring alerts, service intervals, renewals
  isFlagged?: boolean; // For pin/favorites
}

const DB_NAME = 'rebuy_memory_engine';
const DB_VERSION = 1;
const STORE_NAME = 'memories';

export class IndexedDBManager {
  private static instance: IndexedDBManager;
  private db: IDBDatabase | null = null;

  private constructor() {}

  public static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }

  /**
   * Initializes the database connection and handles migrations/schema setup.
   */
  public async initialize(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const oldVersion = event.oldVersion;

        console.log(`[IndexedDB] Upgrading from version ${oldVersion} to ${DB_VERSION}`);

        if (oldVersion < 1) {
          // Create memories object store
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

          // Create indices for lightning fast client-side searching and sorting
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('merchant', 'parsedData.merchant', { unique: false });
          store.createIndex('category', 'parsedData.category', { unique: false });
          store.createIndex('nextReminderDate', 'nextReminderDate', { unique: false });
          
          // multiEntry index allows querying individual tags that are inside the array
          store.createIndex('tags', 'parsedData.tags', { unique: false, multiEntry: true });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.initialize();
  }

  /**
   * Retrieve all memories sorted by creation date descending.
   */
  public async getAll(): Promise<Memory[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      // Cursor to walk in descending order (newest first)
      const request = index.openCursor(null, 'prev');
      const results: Memory[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value as Memory);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save or update a memory record.
   */
  public async save(memory: Memory): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(memory);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a memory record by ID.
   */
  public async delete(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Find a single memory by ID.
   */
  public async getById(id: string): Promise<Memory | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Fast query by index name and target key.
   */
  public async getByIndex(indexName: 'merchant' | 'category' | 'tags', key: string): Promise<Memory[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result as Memory[]);
      request.onerror = () => reject(request.error);
    });
  }
}
