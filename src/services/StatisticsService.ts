import { ReBuyActivity, ObjectStatistics } from '../types';

export class StatisticsService {
  /**
   * Computes statistics for a list of activities associated with a single object.
   * Compares prices normalized to 1 unit (Unit Price = amount / quantity) to ensure fair comparison.
   */
  public static calculate(activities: ReBuyActivity[]): ObjectStatistics {
    const validActivities = activities.filter(a => !a.isArchived);
    
    // Sort activities by date descending (newest first)
    const sorted = [...validActivities].sort(
      (a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
    );

    const purchaseActivities = validActivities.filter(a => a.activityType === 'purchase');
    const amountBearingActivities = validActivities.filter(a => a.amount > 0);

    const purchaseCount = purchaseActivities.length;
    
    // Normalize latest amount to unit price
    const latestAmount = sorted.length > 0 ? (sorted[0].amount / (sorted[0].quantity || 1)) : 0;
    const lastActivityDate = sorted.length > 0 ? sorted[0].activityDate : undefined;

    let lowestAmount = 0;
    let highestAmount = 0;
    let averageAmount = 0;

    if (amountBearingActivities.length > 0) {
      // Extract unit prices
      const unitPrices = amountBearingActivities.map(a => a.amount / (a.quantity || 1));
      lowestAmount = Math.min(...unitPrices);
      highestAmount = Math.max(...unitPrices);
      
      const totalAmount = unitPrices.reduce((sum, val) => sum + val, 0);
      averageAmount = totalAmount / unitPrices.length;
    }

    // Calculate most used shop
    const shopFrequency: Record<string, number> = {};
    let mostUsedShop = 'N/A';
    let maxCount = 0;

    validActivities.forEach(act => {
      if (act.shop && act.shop.trim()) {
        const shopName = act.shop.trim();
        shopFrequency[shopName] = (shopFrequency[shopName] || 0) + 1;
        if (shopFrequency[shopName] > maxCount) {
          maxCount = shopFrequency[shopName];
          mostUsedShop = shopName;
        }
      }
    });

    return {
      purchaseCount,
      latestAmount,
      lowestAmount,
      highestAmount,
      averageAmount: parseFloat(averageAmount.toFixed(2)),
      mostUsedShop,
      lastActivityDate
    };
  }
}
export type { ObjectStatistics };
