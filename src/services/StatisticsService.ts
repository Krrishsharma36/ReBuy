import { ReBuyActivity, ObjectStatistics } from '../types';

export class StatisticsService {
  /**
   * Computes statistics for a list of activities associated with a single object.
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
    const latestAmount = sorted.length > 0 ? sorted[0].amount : 0;
    const lastActivityDate = sorted.length > 0 ? sorted[0].activityDate : undefined;

    let lowestAmount = 0;
    let highestAmount = 0;
    let averageAmount = 0;

    if (amountBearingActivities.length > 0) {
      const amounts = amountBearingActivities.map(a => a.amount);
      lowestAmount = Math.min(...amounts);
      highestAmount = Math.max(...amounts);
      
      const totalAmount = amounts.reduce((sum, val) => sum + val, 0);
      averageAmount = totalAmount / amounts.length;
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

