import { ReBuyDBError } from '../../types';
import { ReBuyDBManager } from '../db';

export interface SearchIndexDocument {
  id: string; // matches objectId for quick updates/deletes
  objectId: string;
  token: string[]; // array of tokens indexed by IndexedDB multiEntry index
}

export class SearchRepository {
  private dbManager = ReBuyDBManager.getInstance();

  /**
   * Indexes keyword tokens for a given object. Overwrites old index docs.
   */
  public async saveTokens(objectId: string, tokens: string[]): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('searchIndex', 'readwrite');
    return new Promise((resolve, reject) => {
      const document: SearchIndexDocument = {
        id: objectId,
        objectId,
        token: tokens
      };
      const request = store.put(document);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to save search tokens for object: ${objectId}`, 'SEARCH_INDEX_SAVE_FAILED', request.error));
    });
  }

  /**
   * Removes all index entries for an object ID.
   */
  public async clearTokens(objectId: string): Promise<void> {
    const { store } = await this.dbManager.getStoreTransaction('searchIndex', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(objectId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new ReBuyDBError(`Failed to clear search tokens for object: ${objectId}`, 'SEARCH_INDEX_CLEAR_FAILED', request.error));
    });
  }

  /**
   * Retrieves all object IDs containing a matching search token.
   */
  public async getObjectIdsByToken(tokenWord: string): Promise<string[]> {
    const { store } = await this.dbManager.getStoreTransaction('searchIndex', 'readonly');
    const index = store.index('token');
    return new Promise((resolve, reject) => {
      const request = index.getAll(tokenWord);
      request.onsuccess = () => {
        const documents = request.result as SearchIndexDocument[];
        resolve(documents.map(doc => doc.objectId));
      };
      request.onerror = () => reject(new ReBuyDBError(`Failed to fetch indexed objectIds for token: ${tokenWord}`, 'SEARCH_INDEX_QUERY_FAILED', request.error));
    });
  }
}
