import { ReBuyObject } from '../types';

export class ObjectMatcher {
  /**
   * Evaluates candidates and returns the best matching object if it meets confidence thresholds.
   */
  public static match(targetName: string, objects: ReBuyObject[]): ReBuyObject | null {
    if (!targetName || objects.length === 0) return null;

    const normalizedTarget = targetName.toLowerCase().trim();
    let bestMatch: ReBuyObject | null = null;
    let highestScore = 0;

    for (const obj of objects) {
      const normalizedObjName = obj.name.toLowerCase().trim();
      let score = 0;

      // Heuristic 1: Exact match (case insensitive)
      if (normalizedObjName === normalizedTarget) {
        score += 100;
      }
      // Heuristic 2: Prefix match (e.g., "mil" matches "milk")
      else if (normalizedObjName.startsWith(normalizedTarget)) {
        score += 50;
      }
      // Heuristic 3: Substring match
      else if (normalizedObjName.includes(normalizedTarget)) {
        score += 30;
      }
      // Heuristic 4: Typo Tolerance (Levenshtein distance <= 2)
      else {
        const distance = this.levenshtein(normalizedObjName, normalizedTarget);
        if (distance <= 2) {
          score += 40 - (distance * 15); // 40 points for dist 1, 25 points for dist 2
        }
      }

      // Heuristic 5: Tag/Alias matching
      const tagMatch = obj.tags.some(t => t.toLowerCase() === normalizedTarget);
      if (tagMatch) {
        score += 25;
      }

      // Add small weights for frequency (popular items rank higher)
      score += Math.min(obj.purchaseCount * 0.5, 10);

      // Add recency booster (items touched recently rank higher)
      if (obj.lastActivityDate) {
        const daysSinceLast = (Date.now() - new Date(obj.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLast < 7) {
          score += 10;
        } else if (daysSinceLast < 30) {
          score += 5;
        }
      }

      if (score > highestScore && score >= 20) {
        highestScore = score;
        bestMatch = obj;
      }
    }

    return bestMatch;
  }

  /**
   * Custom Levenshtein distance calculator.
   */
  private static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,    // deletion
            matrix[i][j - 1] + 1,    // insertion
            matrix[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }

    return matrix[a.length][b.length];
  }
}
