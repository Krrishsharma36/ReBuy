# ReBuy 🧠

> **Mission**: "Remember anything you've bought, repaired, paid for or compared in less than 3 seconds."

ReBuy is a client-side, offline-first, mobile-first **Personal Memory Engine**. It is designed as a frictionless note/purchase memory assistant that feels like a blend of **Apple Notes + Raycast + ChatGPT**. 

*This is NOT an expense tracker, accounting app, or inventory system. It is a memory tool for capturing life purchases, services, quotes, and recurring details.*

---

## ⚡ Golden Rules

1. **Offline First** – All storage is in local IndexedDB. No network database, no latency, no sign-ups required.
2. **Mobile First** – Designed for single-hand, instant capture.
3. **Search First** – Fast fuzzy matching of memories by title, merchant, price, dates, or tags.
4. **Capture Before Organize** – Quick-parse inputs so users don't have to fill out nested forms.
5. **Never Ask for Known Info** – Autocomplete past merchants, prices, and locations.
6. **Typing > Tapping** – Powerful shortcuts and command bar (Raycast style) for rapid entry.
7. **Speed** – Under 3 seconds to recall, under 5 seconds to re-record a repeated transaction.
8. **Simplicity** – Minimal layout, high usability.
9. **Performance** – Built on lightweight core tools, zero bloated external frameworks.
10. **Aesthetic** – Sleek, premium dark-mode interface with smooth micro-interactions.

---

## 🛠️ Tech Stack

- **Bundler / Dev Server**: [Vite](https://vite.dev/)
- **UI Framework**: [React 18+](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Storage**: Browser native [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- **Styling**: Vanilla CSS with modern Custom Properties and CSS Modules
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Inter (Google Fonts)

---

## 📂 Architecture Overview

The project is structured with modularity in mind to support a 10-year maintainability lifecycle:

```text
docs/                 # Design decisions and architecture specifications
public/               # PWA icons, manifest.json, sw.js
src/
  ├── assets/         # Design images and static branding resources
  ├── components/     # Reusable atomic UI (CommandPalette, Button, etc.)
  ├── database/       # IndexedDB custom schema definitions and transactions
  ├── engine/         # Memory ranking and lifecycle logic
  ├── features/       # Feature modules (Capture, Search, Dashboard)
  ├── hooks/          # Global React hooks (useIndexedDB, useKeyboardShortcuts)
  ├── parser/         # Client-side Natural Language Processing tokenizer
  ├── search/         # High performance fuzzy match and indexing engine
  ├── services/       # File import/export, data backup utilities
  ├── styles/         # Global variables, typography, and base styles
  ├── types/          # Strict typescript declaration files
  └── utils/          # General utility helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Krrishsharma36/ReBuy.git
   cd ReBuy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production (prepares static build in `/dist` and compiles TS):
   ```bash
   npm run build
   ```

---

## 📄 License

MIT
