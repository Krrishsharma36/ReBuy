import { ReBuyObject, ReBuyActivity } from '../types';

export class LearningEngine {
  /**
   * Examines historical activities to determine probability-based defaults
   * and updates the object's default attributes.
   */
  public static learn(object: ReBuyObject, activities: ReBuyActivity[]): ReBuyObject {
    const validActivities = activities.filter(a => !a.isArchived);
    if (validActivities.length === 0) return object;

    const updatedObject = { ...object };

    // 1. Calculate most frequent Shop (probability check)
    const shopCounts: Record<string, number> = {};
    let topShop = object.defaultShop;
    let maxShopCount = 0;

    // 2. Calculate most frequent Unit
    const unitCounts: Record<string, number> = {};
    let topUnit = object.defaultUnit;
    let maxUnitCount = 0;

    // 3. Calculate most frequent Quantity
    const qtyCounts: Record<number, number> = {};
    let topQty = object.defaultQuantity;
    let maxQtyCount = 0;

    // 4. Track contacts
    const contactCounts: Record<string, number> = {};
    let topContact = object.defaultContact;
    let maxContactCount = 0;

    validActivities.forEach(act => {
      // Shop
      if (act.shop && act.shop.trim()) {
        const s = act.shop.trim();
        shopCounts[s] = (shopCounts[s] || 0) + 1;
        if (shopCounts[s] > maxShopCount) {
          maxShopCount = shopCounts[s];
          topShop = s;
        }
      }

      // Unit
      if (act.unit && act.unit.trim()) {
        const u = act.unit.trim();
        unitCounts[u] = (unitCounts[u] || 0) + 1;
        if (unitCounts[u] > maxUnitCount) {
          maxUnitCount = unitCounts[u];
          topUnit = u;
        }
      }

      // Quantity
      if (act.quantity) {
        const q = act.quantity;
        qtyCounts[q] = (qtyCounts[q] || 0) + 1;
        if (qtyCounts[q] > maxQtyCount) {
          maxQtyCount = qtyCounts[q];
          topQty = q;
        }
      }

      // Contact
      if (act.contact && act.contact.trim()) {
        const c = act.contact.trim();
        contactCounts[c] = (contactCounts[c] || 0) + 1;
        if (contactCounts[c] > maxContactCount) {
          maxContactCount = contactCounts[c];
          topContact = c;
        }
      }
    });

    // Update defaults if statistical counts suggest a clear preference
    updatedObject.defaultShop = topShop;
    updatedObject.defaultUnit = topUnit;
    updatedObject.defaultQuantity = topQty;
    updatedObject.defaultContact = topContact;
    updatedObject.updatedAt = new Date().toISOString();

    return updatedObject;
  }
}
