# High-Performance Fuzzy Search Engine — ReBuy

To achieve the rule: **"Remember anything you've bought in less than 3 seconds"**, ReBuy uses a client-side weighted search engine (`src/search/engine.ts`).

---

## 📊 Relevance Scoring Matrix

Rather than using basic alphabetical or string indexing search, ReBuy scores every candidate memory against a series of heuristics. This ensures that the most logical matches show up at the top, just like in **Raycast** or **Spotlight Search**.

| Feature Matches | Base Score Weight | Description |
|-----------------|-------------------|-------------|
| **Exact Merchant Match** | `+20 points` | The query explicitly matches the memory's parsed merchant name. |
| **Partial Merchant Match**| `+10 points` | The query string is a substring of the parsed merchant. |
| **Tag Match** | `+15 points (each)`| Explicit tag overlaps (e.g. searching `#sub` matches memory tag `#sub`). |
| **Raw Content Match** | `+5 points` | The keyword is found in the memory's raw notes string. |
| **Prefix Boundary Match** | `+4 points` | The search term is at a word boundary (e.g. "coff" matches the start of "coffee"). |
| **Merchant Content Match** | `+8 points` | A general query word matches part of the merchant name. |
| **Tag Content Match** | `+6 points` | A general query word matches part of a tag name. |

---

## 📈 Recency Multiplier (Time Decay)

Memories are often bound to temporal relevance (e.g., you are more likely to search for a purchase made 2 days ago than one made 2 years ago). We apply a **Recency Boost Multiplier** to scale scores:

### Math Equation
$$\text{Relevance Score} = \text{Base Score} \times \text{Recency Multiplier}$$

Where:
- $\text{Age}$ is the age of the record in days.
- If $\text{Age} \le 0$ days: Multiplier = `2.0` (Fresh memory boost)
- If $\text{Age} \ge 30$ days: Multiplier = `1.0` (Standard score)
- If $0 < \text{Age} < 30$: Multiplier is linear decay:
  $$\text{Multiplier} = 1.0 + \left(1.0 - \frac{\text{Age}}{30}\right)$$

This ensures that a memory from yesterday will outrank an identical memory from last year when search queries overlap.

---

## 🖍️ UI Highlighting Integration

The search engine tracks matched character spans (indices):

```typescript
interface SearchResult {
  memory: Memory;
  score: number;
  matches: {
    key: string;
    indices: [number, number][]; // Highlighting segments
  }[];
}
```

The rendering component maps over these indices to wrap matched segments in a `<mark>` HTML tag, indicating matching query segments to the user visually.
