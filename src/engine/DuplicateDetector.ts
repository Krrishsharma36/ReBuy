import { ReBuyActivity } from '../types';

export class DuplicateDetector {
  /**
   * Compares a proposed activity against existing activities.
   * Returns matching duplicate activity if logged within the time window.
   * Default window: 5 minutes (300,000 milliseconds)
   */
  public static check(
    newActivity: Partial<ReBuyActivity>,
    existingActivities: ReBuyActivity[],
    windowMs: number = 5 * 60 * 1000
  ): ReBuyActivity | null {
    if (!newActivity.objectId || newActivity.amount === undefined) return null;

    const newTime = newActivity.activityDate 
      ? new Date(newActivity.activityDate).getTime() 
      : Date.now();

    for (const act of existingActivities) {
      if (act.isArchived) continue;

      // Check key similarities
      const sameObject = act.objectId === newActivity.objectId;
      const sameType = act.activityType === newActivity.activityType;
      
      // Allow minor floating point variances in amount comparisons
      const sameAmount = Math.abs(act.amount - newActivity.amount) < 0.01;

      if (sameObject && sameType && sameAmount) {
        const actTime = new Date(act.activityDate).getTime();
        const diff = Math.abs(newTime - actTime);

        if (diff <= windowMs) {
          return act; // Duplicate detected
        }
      }
    }

    return null;
  }
}
