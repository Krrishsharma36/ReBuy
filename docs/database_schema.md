# Database Schema Design — ReBuy

ReBuy uses browser-native **IndexedDB** to store purchase memories locally. This document outlines the structural properties, indices, and maintenance strategy for the database.

---

## 🗄️ Storage Schema

We maintain a single store named `memories` in the database named `rebuy_memory_engine`.

### Memory Document structure

```typescript
interface Memory {
  id: string;                      // Primary Key (UUID v4 or unique timestamp string)
  rawText: string;                 // The unparsed raw input typed by the user
  createdAt: Date;                 // Time of creation (used for recency sorting)
  updatedAt: Date;                 // Time of modification
  nextReminderDate?: Date;         // Active reminder alarm date (e.g., service due)
  isFlagged?: boolean;             // Pinned priority items
  parsedData: {
    price?: number;                // Cost amount (parsed from $)
    currency?: string;             // ISO-4217 Currency (defaults to USD)
    merchant?: string;             // Supplier name (parsed from @)
    category?: string;             // Classification category (inferred from tags/rules)
    tags: string[];                // Multi-tags array (parsed from #)
    date?: Date;                   // Explicit timestamp of the memory (parsed from text)
    rawParsedValues: Record<string, any>; // Debug values / Parser telemetry
  };
}
```

---

## 🎯 IndexedDB Indices

To execute queries in under 3 milliseconds on mobile devices, the following indices are maintained:

| Index Name | Path | MultiEntry | Purpose |
|------------|------|------------|---------|
| `createdAt` | `createdAt` | No | Sorting records in chronological order (newest first) |
| `updatedAt` | `updatedAt` | No | Backup sync delta queries |
| `merchant` | `parsedData.merchant` | No | Filtering records by merchant and autocompleting inputs |
| `category` | `parsedData.category` | No | Organizing metrics dashboard |
| `nextReminderDate` | `nextReminderDate` | No | Fetching active renewal alarms |
| `tags` | `parsedData.tags` | **Yes** | Allows filtering by tag items from the nested array |

*Note on MultiEntry Indexing*: The `tags` index is created with `multiEntry: true`. This allows IndexedDB to create index records for *each individual element* in the tag array, making tag queries like `"find all entries containing tag #coffee"` highly optimized.

---

## 🔄 Version Migrations

To maintain compatibility over the next 10 years, upgrades must follow sequential conditional versioning:

```typescript
request.onupgradeneeded = (event) => {
  const db = request.result;
  const oldVersion = event.oldVersion;

  if (oldVersion < 1) {
    // Initial schema configuration
    const store = db.createObjectStore('memories', { keyPath: 'id' });
    store.createIndex('createdAt', 'createdAt', { unique: false });
    // ... indices setup
  }
  
  if (oldVersion < 2) {
    // Example: If a future feature requires a new "location" index
    // const store = transaction.objectStore('memories');
    // store.createIndex('location', 'parsedData.location', { unique: false });
  }
};
```
