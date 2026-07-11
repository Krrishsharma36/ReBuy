export interface AnalyzedInput {
  rawText: string;
  matchedObjectName?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
  shop?: string;
  contact?: string;
  date?: string; // ISO date string
  tags: string[];
  remarks?: string;
}

const COMMON_UNITS = ['kg', 'gm', 'g', 'l', 'ml', 'pcs', 'pc', 'pack', 'packs', 'bottle', 'bottles', 'box', 'boxes', 'm', 'ft'];

export class InputAnalyzer {
  /**
   * Parses raw input text into structured fields based on token analysis.
   */
  public static analyze(
    inputText: string,
    knownObjects: string[] = [],
    knownShops: string[] = [],
    knownContacts: string[] = []
  ): AnalyzedInput {
    const rawText = inputText.trim();
    let text = rawText;

    // 1. Extract Tags (e.g. #food)
    const tags: string[] = [];
    const tagRegex = /#([\w-]+)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(text)) !== null) {
      tags.push(tagMatch[1].toLowerCase());
    }
    text = text.replace(/#[\w-]+/g, ''); // strip tags

    // 2. Extract explicit shop indicator with @ (e.g. @Starbucks)
    let shop: string | undefined;
    const shopRegex = /@([\w\s-]+?)(?=\s[#$@]|$)|\b@([\w-]+)/g;
    const shopMatch = shopRegex.exec(text);
    if (shopMatch) {
      shop = (shopMatch[1] || shopMatch[2]).trim();
      text = text.replace(shopMatch[0], ''); // strip @shop
    }

    // 3. Extract Dates
    let date: string | undefined;
    const lowerText = text.toLowerCase();
    if (/\byesterday\b/i.test(lowerText)) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      date = d.toISOString();
      text = text.replace(/\byesterday\b/i, '');
    } else if (/\btoday\b/i.test(lowerText)) {
      date = new Date().toISOString();
      text = text.replace(/\btoday\b/i, '');
    } else if (/\btomorrow\b/i.test(lowerText)) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      date = d.toISOString();
      text = text.replace(/\btomorrow\b/i, '');
    }

    // 4. Tokenize remaining text
    // Split by spaces but preserve words
    const tokens = text.split(/\s+/).filter(Boolean);

    let amount: number | undefined;
    let quantity: number | undefined;
    let unit: string | undefined;
    let matchedObjectName: string | undefined;
    const remainingWords: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const tokenLower = token.toLowerCase();

      // Check if token matches quantity + unit combined (e.g. "10kg" or "1.5L")
      const qtyUnitRegex = /^(\d+(?:\.\d+)?)([a-zA-Z]+)$/;
      const qtyUnitMatch = qtyUnitRegex.exec(token);
      if (qtyUnitMatch) {
        const val = parseFloat(qtyUnitMatch[1]);
        const unitName = qtyUnitMatch[2].toLowerCase();
        if (COMMON_UNITS.includes(unitName)) {
          quantity = val;
          unit = unitName;
          continue;
        }
      }

      // Check if token is a standard price / number
      // e.g. "$66" or "66" or "15.49"
      const numberRegex = /^\$?(\d+(?:\.\d{1,2})?)\$?$/;
      const numberMatch = numberRegex.exec(token);
      if (numberMatch) {
        const val = parseFloat(numberMatch[1]);
        // If there's a subsequent token matching a unit, this number is a quantity
        const nextToken = tokens[i + 1]?.toLowerCase();
        if (nextToken && COMMON_UNITS.includes(nextToken)) {
          quantity = val;
          unit = nextToken;
          i++; // skip next token since we consumed it as unit
        } else if (amount === undefined) {
          amount = val;
        } else {
          // If amount is already matched, treat this second number as a quantity helper
          quantity = val;
        }
        continue;
      }

      // Check if unit is standing alone (e.g. consumed by previous loop checks)
      if (COMMON_UNITS.includes(tokenLower)) {
        unit = tokenLower;
        continue;
      }

      remainingWords.push(token);
    }

    // 5. Match known elements in remaining words
    // We match greedy combinations of words against knownObjects, knownShops, knownContacts
    let reconstructedText = remainingWords.join(' ');

    // Match Known Object Name
    for (const obj of knownObjects) {
      const regex = new RegExp(`\\b${this.escapeRegExp(obj)}\\b`, 'i');
      if (regex.test(reconstructedText)) {
        matchedObjectName = obj;
        reconstructedText = reconstructedText.replace(regex, '').trim();
        break;
      }
    }

    // Match Known Shop (if not already found via @)
    if (!shop) {
      for (const sh of knownShops) {
        const regex = new RegExp(`\\b${this.escapeRegExp(sh)}\\b`, 'i');
        if (regex.test(reconstructedText)) {
          shop = sh;
          reconstructedText = reconstructedText.replace(regex, '').trim();
          break;
        }
      }
    }

    // Match Known Contact
    let contact: string | undefined;
    for (const ct of knownContacts) {
      const regex = new RegExp(`\\b${this.escapeRegExp(ct)}\\b`, 'i');
      if (regex.test(reconstructedText)) {
        contact = ct;
        reconstructedText = reconstructedText.replace(regex, '').trim();
        break;
      }
    }

    // If no known object matched, the first word(s) before amount might be the object name
    if (!matchedObjectName && remainingWords.length > 0) {
      // Find the words before the amount position (if any) or just take the first word as the object name
      matchedObjectName = remainingWords[0];
      reconstructedText = remainingWords.slice(1).join(' ');
    }

    return {
      rawText,
      matchedObjectName: matchedObjectName?.trim(),
      amount,
      quantity,
      unit,
      shop,
      contact,
      date: date || new Date().toISOString(),
      tags,
      remarks: reconstructedText.trim() || undefined
    };
  }

  private static escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
