import { ReBuyObject } from '../types';
import { SearchRepository } from '../database/repositories/SearchRepository';
import { ObjectRepository } from '../database/repositories/ObjectRepository';

export class SearchService {
  private searchRepo = new SearchRepository();
  private objectRepo = new ObjectRepository();

  /**
   * Generates search index tokens for an object and saves them.
   * Runs during inserts/updates.
   */
  public async indexObject(object: ReBuyObject): Promise<void> {
    const tokens = new Set<string>();

    // Tokenize Name
    object.name.toLowerCase().split(/\s+/).forEach(t => {
      const clean = t.replace(/[^\w]/g, '').trim();
      if (clean) tokens.add(clean);
    });

    // Tokenize Brand
    if (object.brand) {
      object.brand.toLowerCase().split(/\s+/).forEach(t => {
        const clean = t.replace(/[^\w]/g, '').trim();
        if (clean) tokens.add(clean);
      });
    }

    // Tokenize Tags
    object.tags.forEach(tag => {
      const clean = tag.toLowerCase().trim();
      if (clean) tokens.add(clean);
    });

    // Tokenize Shop
    if (object.defaultShop) {
      object.defaultShop.toLowerCase().split(/\s+/).forEach(t => {
        const clean = t.replace(/[^\w]/g, '').trim();
        if (clean) tokens.add(clean);
      });
    }

    await this.searchRepo.saveTokens(object.id, Array.from(tokens));
  }

  /**
   * Removes search tokens when deleting objects.
   */
  public async deindexObject(objectId: string): Promise<void> {
    await this.searchRepo.clearTokens(objectId);
  }

  /**
   * Fast queries the database using pre-computed token indexes.
   * Matches intersection of keywords, fetching only relevant documents.
   */
  public async search(queryText: string): Promise<ReBuyObject[]> {
    const queryTokens = queryText
      .toLowerCase()
      .split(/\s+/)
      .map(t => t.replace(/[^\w]/g, '').trim())
      .filter(Boolean);

    if (queryTokens.length === 0) {
      // If search query is empty, return all non-archived objects
      return this.objectRepo.getAll(false);
    }

    // Retrieve matching object IDs for each token
    const tokenMatches: string[][] = [];
    for (const token of queryTokens) {
      const matchedIds = await this.searchRepo.getObjectIdsByToken(token);
      tokenMatches.push(matchedIds);
    }

    if (tokenMatches.length === 0) return [];

    // Calculate intersection (object must match ALL token queries)
    let intersectedIds = tokenMatches[0];
    for (let i = 1; i < tokenMatches.length; i++) {
      const set = new Set(tokenMatches[i]);
      intersectedIds = intersectedIds.filter(id => set.has(id));
    }

    if (intersectedIds.length === 0) return [];

    // Load only matching objects from objects store
    const results: ReBuyObject[] = [];
    for (const objectId of intersectedIds) {
      const obj = await this.objectRepo.get(objectId);
      if (obj && !obj.isArchived) {
        results.push(obj);
      }
    }

    // Return objects sorted by search relevance / favoriteScore
    return results.sort((a, b) => b.favoriteScore - a.favoriteScore);
  }
}
