import { ParsedMemoryData } from '../database/db';

export type TokenType = 'price' | 'merchant' | 'tag' | 'date' | 'text';

export interface Token {
  type: TokenType;
  value: string;
  raw: string;
  index: number;
}

export interface ITokenExtractor {
  extract(text: string, tokens: Token[]): { updatedText: string; tokens: Token[] };
}

/**
 * NaturalLanguageParser manages a pipeline of extractors that process a single capture string.
 * This architecture makes it easy to add custom extractors in the future (e.g. location, recurrence).
 */
export class NaturalLanguageParser {
  private extractors: ITokenExtractor[] = [];

  constructor() {
    this.registerDefaultExtractors();
  }

  /**
   * Register default extractors for price, tags, merchants, and dates.
   */
  private registerDefaultExtractors() {
    this.extractors.push(
      new TagExtractor(),
      new MerchantExtractor(),
      new PriceExtractor(),
      new DateExtractor()
    );
  }

  /**
   * Parses the user raw input text into a structured memory data object.
   */
  public parse(inputText: string): ParsedMemoryData {
    let processingText = inputText.trim();
    let tokens: Token[] = [];

    // Run the text through the pipeline of extractors
    for (const extractor of this.extractors) {
      const result = extractor.extract(processingText, tokens);
      processingText = result.updatedText;
      tokens = result.tokens;
    }

    // Map extracted tokens to the ParsedMemoryData object
    const tags = tokens.filter(t => t.type === 'tag').map(t => t.value);
    const merchant = tokens.find(t => t.type === 'merchant')?.value;
    const priceToken = tokens.find(t => t.type === 'price');
    const price = priceToken ? parseFloat(priceToken.value) : undefined;
    const dateToken = tokens.find(t => t.type === 'date');
    const date = dateToken ? new Date(dateToken.value) : new Date(); // Default to today if omitted

    return {
      price,
      currency: priceToken?.raw.startsWith('$') ? 'USD' : 'USD', // Placeholder currency detection
      merchant,
      tags,
      date,
      rawParsedValues: {
        remainingText: processingText.trim(),
        tokens: tokens.map(t => ({ type: t.type, value: t.value }))
      }
    };
  }
}

/**
 * Extracts hashtags (e.g., "#coffee", "#car-repair") from the input string.
 */
class TagExtractor implements ITokenExtractor {
  public extract(text: string, tokens: Token[]): { updatedText: string; tokens: Token[] } {
    const tagRegex = /#([\w-]+)/g;
    const newTokens = [...tokens];
    let match;
    let updatedText = text;

    while ((match = tagRegex.exec(text)) !== null) {
      newTokens.push({
        type: 'tag',
        value: match[1].toLowerCase(),
        raw: match[0],
        index: match.index
      });
      // Replace matching tag with whitespace to keep character indexing intact if needed
      updatedText = updatedText.replace(match[0], '');
    }

    return { updatedText, tokens: newTokens };
  }
}

/**
 * Extracts merchants using the '@' symbol (e.g., "@Starbucks", "@PepBoys").
 */
class MerchantExtractor implements ITokenExtractor {
  public extract(text: string, tokens: Token[]): { updatedText: string; tokens: Token[] } {
    const merchantRegex = /@([\w\s-]+?)(?=\s[#$@]|$)|\b@([\w-]+)/g;
    const newTokens = [...tokens];
    let match;
    let updatedText = text;

    while ((match = merchantRegex.exec(text)) !== null) {
      const value = (match[1] || match[2]).trim();
      newTokens.push({
        type: 'merchant',
        value,
        raw: match[0],
        index: match.index
      });
      updatedText = updatedText.replace(match[0], '');
    }

    return { updatedText, tokens: newTokens };
  }
}

/**
 * Extracts currency prices (e.g., "$4.50", "45.00$").
 */
class PriceExtractor implements ITokenExtractor {
  public extract(text: string, tokens: Token[]): { updatedText: string; tokens: Token[] } {
    const priceRegex = /\$?(\d+(?:\.\d{2})?)\$?/g; // Simple currency extraction matches
    const newTokens = [...tokens];
    let match;
    let updatedText = text;

    // Run custom rule checks (e.g. check for matching digit sequences with currency symbols)
    while ((match = priceRegex.exec(text)) !== null) {
      const rawPrice = match[0];
      const parsedVal = match[1];
      
      // Basic check to ensure it's not a year or other non-currency numbers
      if (rawPrice.includes('$') || (parsedVal.includes('.') && parseFloat(parsedVal) > 0)) {
        newTokens.push({
          type: 'price',
          value: parsedVal,
          raw: rawPrice,
          index: match.index
        });
        updatedText = updatedText.replace(rawPrice, '');
        break; // Stop at first price token for simple inputs
      }
    }

    return { updatedText, tokens: newTokens };
  }
}

/**
 * Extracts relative date terms (e.g., "yesterday", "today") or absolute dates.
 */
class DateExtractor implements ITokenExtractor {
  public extract(text: string, tokens: Token[]): { updatedText: string; tokens: Token[] } {
    const newTokens = [...tokens];
    let updatedText = text;

    const lowerText = text.toLowerCase();
    let detectedDate: Date | null = null;
    let matchStr = '';

    if (lowerText.includes('yesterday')) {
      detectedDate = new Date();
      detectedDate.setDate(detectedDate.getDate() - 1);
      matchStr = 'yesterday';
    } else if (lowerText.includes('today')) {
      detectedDate = new Date();
      matchStr = 'today';
    } else if (lowerText.includes('tomorrow')) {
      detectedDate = new Date();
      detectedDate.setDate(detectedDate.getDate() + 1);
      matchStr = 'tomorrow';
    }

    if (detectedDate && matchStr) {
      newTokens.push({
        type: 'date',
        value: detectedDate.toISOString(),
        raw: matchStr,
        index: lowerText.indexOf(matchStr)
      });
      // Remove match string
      const regex = new RegExp(`\\b${matchStr}\\b`, 'i');
      updatedText = updatedText.replace(regex, '');
    }

    return { updatedText, tokens: newTokens };
  }
}
