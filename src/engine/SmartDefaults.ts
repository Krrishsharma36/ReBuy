import { AnalyzedInput } from './InputAnalyzer';
import { ReBuyObject } from '../types';

export class SmartDefaults {
  /**
   * Applies defaults from an existing object to any fields left unspecified in the parsed input.
   * "Never ask for information already known."
   */
  public static apply(input: AnalyzedInput, object: ReBuyObject): AnalyzedInput {
    const result = { ...input };

    if (!result.shop && object.defaultShop) {
      result.shop = object.defaultShop;
    }

    if (!result.contact && object.defaultContact) {
      result.contact = object.defaultContact;
    }

    if (result.quantity === undefined && object.defaultQuantity !== undefined) {
      result.quantity = object.defaultQuantity;
    }

    if (!result.unit && object.defaultUnit) {
      result.unit = object.defaultUnit;
    }

    // Merge tags (combining new tags typed by the user with existing object tags)
    const combinedTags = new Set([...result.tags, ...object.tags]);
    result.tags = Array.from(combinedTags);

    return result;
  }
}
