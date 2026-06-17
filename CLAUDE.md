# Spendy — Session Összefoglaló

## Mi ez az app?
Kiadás-bevétel követő PWA otthoni használatra, maximum 2 felhasználónak. Magyar nyelvű UI, HUF pénznem.

## Tech Stack
- **Frontend:** React 18 + Vite + TypeScript (`verbatimModuleSyntax: true` → minden típusimport `import type`)
- **Stílus:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, nincs tailwind.config.ts)
- **Routing:** React Router v6
- **State:** Zustand (persist middleware — csak `users` és `currentUserId` perzisztálódik)
- **Charts:** Recharts
- **PWA:** vite-plugin-pwa
- **Adattárolás:** localStorage (src/api/storage.ts)
- **AI blokk-elemzés:** Claude Haiku API (VITE_ANTHROPIC_API_KEY kell)

## Design rendszer
- **Háttér:** `linear-gradient(160deg, #1a0e3f 0%, #3b1d8c 30%, #6d28d9 65%, #4c1d95 100%)` — teljes app, body-n, `background-attachment: fixed`
- **Glass kártyák:** `background: rgba(255,255,255,0.10)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.18)`
- **Erős glass (modal):** `background: rgba(15,8,45,0.92)`, `backdrop-filter: blur(50px)`
- **Szöveg:** fehér és `rgba(255,255,255,0.X)` árnyalatok (sötét háttér miatt)
- **Accent szín:** `#7c3aed` (purple-700), gradient gombokra: `#a78bfa → #7c3aed → #5b21b6`
- **Bevétel zöld:** `#4ade80`, **Kiadás piros:** `#f87171`
- **Max-width:** `430px` (mobile-first), desktop-en lila glow-os oszlop
- **Rounding:** `rounded-2xl` kártyák, `rounded-3xl` modálok és nav

## Fájlstruktúra
```
src/
├── api/
│   ├── storage.ts       ← összes localStorage CRUD (getTransactions, addTransaction, stb.)
│   └── claude.ts        ← blokk-fotó AI elemzés (analyzeReceipt)
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx      ← 5 részes nav: Home|Stats|[+]|Recurring|Transactions
│   │   └── UserSwitcher.tsx   ← jobb felső sarok pill, dropdown user-váltóval
│   ├── dashboard/
│   │   ├── BalanceSummary.tsx  (nem használt — logika Home.tsx-be került)
│   │   └── UpcomingRecurring.tsx
│   ├── transactions/
│   │   ├── AddTransactionModal.tsx   ← dark glass modal, kiadás/bevétel toggle
│   │   ├── TransactionCard.tsx
│   │   └── CategoryIcon.tsx
│   ├── statistics/
│   │   ├── CategoryPieChart.tsx  ← Recharts PieChart, dark tooltip
│   │   └── TrendBarChart.tsx     ← Recharts BarChart, dark tooltip
│   └── recurring/
│       ├── RecurringItem.tsx
│       └── AddRecurringModal.tsx  ← dark glass modal
├── pages/
│   ├── Home.tsx          ← balance hero, user switcher, upcoming, recent
│   ├── Statistics.tsx    ← heti/havi toggle, pie + bar chart
│   ├── Transactions.tsx  ← típus + kategória szűrő
│   ├── Recurring.tsx     ← sablon lista, fizetettnek jelölés
│   └── Onboarding.tsx    ← első indítás, 2 user setup
├── store/useStore.ts    ← users, currentUserId, showAddModal, dataVersion, bumpData()
├── types/index.ts
└── utils/
    ├── currency.ts      ← formatHUF(), parseAmount()
    └── categories.ts    ← CATEGORIES tömb (8 kategória emoji+szín), getCategoryInfo()
```

## Adatmodell (localStorage — kulcs: `spendy_data`)
```ts
AppData {
  users: User[]                        // id, name, color
  transactions: Transaction[]          // id, userId, type, amount, category, description, date, aiAnalyzed
  recurringTemplates: RecurringTemplate[]  // id, userId, name, amount, category, dueDay(1-31), isActive
  recurringInstances: RecurringInstance[]  // id, templateId, year, month, paidAt, paidByUserId
}
```

**Kategóriák:** élelmiszer 🛒 · rezsi 💡 · lakás 🏠 · közlekedés 🚗 · egészség ❤️ · szórakozás 🎬 · ruha 👕 · egyéb 📦

## Fontos patterns
- **`bumpData()`** — Zustand `dataVersion` növelése, hogy az oldalak `useMemo`-ja újrafusson adatmutáció után
- **`import type`** — kötelező TypeScript strict módban minden típusnál
- **Recharts Tooltip formatter:** `(v) => [formatHUF(Number(v ?? 0)), '']` (nem `(v: number)`)
- **Inline style vs Tailwind:** backdrop-filter és komplex glass effectek inline `style={}` proppal vannak, mert Tailwind v4 arbitrary value-k néha nem generálódnak

## Env fájl (.env.local)
```
VITE_ANTHROPIC_API_KEY=sk-ant-...   # Anthropic Console: https://console.anthropic.com
```
Ha nincs kulcs, a Blokk gomb alert-et dob, de a kézi bevitel működik.

## Dev szerver
```bash
npm run dev    # http://localhost:5173
npm run build  # production build
```

## Amit még meg lehetne csinálni (backlog)
- [ ] Supabase integráció (jelenleg csak localStorage — 2 különböző eszközön nem szinkronizál)
- [ ] Tranzakció szerkesztés / törlés (jelenleg csak felvitel van)
- [ ] Havi riport export (PDF vagy CSV)
- [ ] Push értesítés esedékes számlákra
- [ ] PWA ikonok (icon-192.png, icon-512.png — jelenleg hiányoznak a public/ mappából)
- [ ] Onboarding után settings oldal (felhasználónevek szerkesztése, reset)
- [ ] Blokk-képek Supabase Storage-ba mentése (jelenleg nem tároljuk a képet)
