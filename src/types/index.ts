export interface ReBuyObject {
  id: string; // unique UUID
  name: string; // e.g. "Milk"
  normalizedName: string; // e.g. "milk" for searching
  type: string; // e.g. "purchase", "service", "quote"
  brand?: string; // e.g. "Horizon Organic"
  variant?: string; // e.g. "Whole Milk, 1 Gallon"
  defaultQuantity?: number; // e.g. 1
  defaultUnit?: string; // e.g. "gallon", "pc"
  defaultShop?: string; // e.g. "Whole Foods"
  defaultContact?: string;
  tags: string[]; // e.g. ["grocery", "dairy"]
  remarks?: string;
  purchaseCount: number;
  lastAmount?: number;
  lastActivityDate?: string; // ISO date string
  favoriteScore: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isArchived: boolean;
}

export interface ReBuyActivity {
  id: string; // unique UUID
  objectId: string; // foreign key mapping to ReBuyObject
  activityType: 'purchase' | 'service' | 'repair' | 'quote' | 'visit';
  amount: number; // e.g. 5.99
  quantity: number; // e.g. 1
  unit?: string; // e.g. "gallon"
  shop?: string; // e.g. "Whole Foods"
  contact?: string;
  remarks?: string;
  activityDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isArchived: boolean;
}

export interface PreferenceItem {
  key: string;
  value: any;
}

export interface MetadataItem {
  key: string;
  value: any;
}

export interface SearchIndexItem {
  id: string; // unique id (objectId + "_" + token)
  objectId: string; // foreign key mapping to ReBuyObject
  token: string; // searchable token word
}

export interface ObjectStatistics {
  purchaseCount: number;
  latestAmount: number;
  lowestAmount: number;
  highestAmount: number;
  averageAmount: number;
  mostUsedShop: string;
  lastActivityDate?: string;
}

/**
 * Custom typed error class to prevent silent failures.
 */
export class ReBuyDBError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ReBuyDBError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ReBuyDBError.prototype);
  }
}
export * from '../parser/nlp';
export * from '../search/engine';
