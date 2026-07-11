export * from '../database/db';
export * from '../parser/nlp';
export * from '../search/engine';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  offlineSyncEnabled: boolean;
  defaultCurrency: string;
  keyboardLayout: 'standard' | 'vim';
}

export interface UserPreferences {
  recentTags: string[];
  recentMerchants: string[];
}
