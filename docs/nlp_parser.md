# Natural Language Parser (NLP) — ReBuy

The goal of the parser is to support the rule: **"Capture Before Organize"** and **"Typing must always be faster than tapping"**. It must process raw text and parse transaction components (prices, tags, dates, merchants) instantly in the client.

---

## ⚙️ Parsing Pipeline Flow

The text goes through a chain of extractor modules, each identifying a specific token, saving its attributes, and stripping it from the parsing line to simplify subsequent matches:

```text
Raw Capture: "Tire rotation $120 @ PepBoys yesterday #car #repairs"
  │
  ├── 1. TagExtractor matches and strips "#car", "#repairs"
  │      Parsed Tokens: [Tag: "car", Tag: "repairs"]
  │      Remaining Line: "Tire rotation $120 @ PepBoys yesterday"
  │
  ├── 2. MerchantExtractor matches and strips "@ PepBoys"
  │      Parsed Tokens: [Tag: "car", Tag: "repairs", Merchant: "PepBoys"]
  │      Remaining Line: "Tire rotation $120 yesterday"
  │
  ├── 3. PriceExtractor matches and strips "$120"
  │      Parsed Tokens: [Tag: "car", Tag: "repairs", Merchant: "PepBoys", Price: 120]
  │      Remaining Line: "Tire rotation yesterday"
  │
  └── 4. DateExtractor matches and strips "yesterday"
         Parsed Tokens: [Tag: "car", Tag: "repairs", Merchant: "PepBoys", Price: 120, Date: 2026-07-11T12:00:00Z]
         Final Note Title: "Tire rotation"
```

---

## 🔍 RegEx Specification

To prevent slow page rendering, extractors use lightweight native JS Regular Expressions:

### 1. Tag Extractor
Matches tags prefixed with `#` containing word characters or hyphens.
- **Regex**: `/#([\w-]+)/g`
- **Example**: Matches `#home-improvement` -> value `home-improvement`.

### 2. Merchant Extractor
Matches words prefixed with `@`, searching up to the next structural token.
- **Regex**: `/@([\w\s-]+?)(?=\s[#$@]|$)/g`
- **Example**: Matches `@Whole Foods` -> value `Whole Foods`.

### 3. Price Extractor
Matches numbers containing decimal points or prefixed/suffixed with the currency symbol `$`.
- **Regex**: `/\$?(\d+(?:\.\d{2})?)\$?/`
- **Example**: Matches `$45.50` -> value `45.50`.

### 4. Date Extractor
Matches relative vocabulary words or calendar-based formats.
- **Keywords**: `today`, `yesterday`, `tomorrow`.
- **Future upgrades**: Relative offsets (`in 2 weeks`, `next month`) for active reminders.
