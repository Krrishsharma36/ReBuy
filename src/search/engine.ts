import { Memory } from '../database/db';

export interface SearchQuery {
  rawQuery: string;
  tags: string[];
  merchant?: string;
  category?: string;
}

export interface SearchResult {
  memory: Memory;
  score: number; // Rank matching relevance score
  matches: {
    key: string;
    indices: [number, number][]; // Highlighting segments
  }[];
}

export class SearchEngine {
  /**
   * Evaluates and ranks a list of memory logs against a SearchQuery.
   * Runs local indexing and multi-tier relevance scoring.
   */
  public search(memories: Memory[], query: SearchQuery): SearchResult[] {
    const searchTerms = query.rawQuery.toLowerCase().split(/\s+/).filter(Boolean);
    
    if (searchTerms.length === 0 && query.tags.length === 0 && !query.merchant) {
      // Default: Return all records scored purely by recency
      return memories.map(memory => ({
        memory,
        score: this.calculateRecencyMultiplier(memory),
        matches: []
      }));
    }

    const results: SearchResult[] = [];

    for (const memory of memories) {
      let score = 0;
      const matches: SearchResult['matches'] = [];

      // 1. Tag matching check (highly weighted)
      if (query.tags.length > 0) {
        const matchingTagsCount = memory.parsedData.tags.filter(t => 
          query.tags.map(qt => qt.toLowerCase()).includes(t.toLowerCase())
        ).length;
        if (matchingTagsCount > 0) {
          score += matchingTagsCount * 15; // 15 points per matching tag
        }
      }

      // 2. Merchant matching check (high weight)
      if (query.merchant && memory.parsedData.merchant) {
        if (memory.parsedData.merchant.toLowerCase() === query.merchant.toLowerCase()) {
          score += 20; // 20 points for exact merchant match
        } else if (memory.parsedData.merchant.toLowerCase().includes(query.merchant.toLowerCase())) {
          score += 10;
        }
      }

      // 3. Raw text search terms matching
      const rawTextLower = memory.rawText.toLowerCase();
      let termsMatched = 0;

      for (const term of searchTerms) {
        // Check exact match of the term
        if (rawTextLower.includes(term)) {
          termsMatched++;
          let termScore = 5;

          // Extra weight if term matches merchant
          if (memory.parsedData.merchant?.toLowerCase().includes(term)) {
            termScore += 8;
          }
          // Extra weight if term matches tag
          if (memory.parsedData.tags.some(t => t.toLowerCase().includes(term))) {
            termScore += 6;
          }
          // Extra weight if term is a boundary/prefix start
          if (rawTextLower.startsWith(term) || rawTextLower.includes(` ${term}`)) {
            termScore += 4;
          }

          score += termScore;

          // Track matching index for highlight rendering in client UI
          const index = rawTextLower.indexOf(term);
          matches.push({
            key: 'rawText',
            indices: [[index, index + term.length]]
          });
        }
      }

      // Query filtration: If search terms are specified, memory MUST match at least one term
      if (searchTerms.length > 0 && termsMatched === 0) {
        continue;
      }

      // Apply recency boost multiplier
      const recencyBoost = this.calculateRecencyMultiplier(memory);
      score = score * recencyBoost;

      if (score > 0) {
        results.push({
          memory,
          score,
          matches
        });
      }
    }

    // Sort results by relevance score (descending)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculates a multiplier based on the age of the record.
   * Keeps newer memories prioritized when search scores are tied.
   */
  private calculateRecencyMultiplier(memory: Memory): number {
    const ageInDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    
    // Scale multiplier: 2.0 for fresh memories, tapering off to 1.0 for memories older than 30 days
    if (ageInDays <= 0) return 2.0;
    if (ageInDays >= 30) return 1.0;
    return 1.0 + (1.0 - (ageInDays / 30));
  }
}
