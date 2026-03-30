

## Progress Analytics Page

### Overview
Add a new "Analytics" page with interactive charts showing weekly calorie trends, workout frequency, and weight tracking. Uses Recharts (already common in shadcn/Tailwind projects) to render line, bar, and area charts from localStorage data.

### Changes

**1. Install recharts dependency**
Add `recharts` for chart rendering.

**2. Create `src/pages/AnalyticsPage.tsx`**
Three chart sections in a responsive grid:

- **Weekly Calorie Trend** — Area chart showing daily calories consumed (from `fitgenius_foodlog`) vs burned (from `fitgenius_workouts`) over the last 7 days. Aggregates food log timestamps and workout `completedAt` by date.

- **Workout Frequency** — Bar chart showing number of workouts per day over the last 7 days, color-coded by workout type. Pulls from `fitgenius_workouts`.

- **Weight Tracker** — Line chart with historical weight entries. Adds a new `fitgenius_weight_history` localStorage key (array of `{date, weight}`). Includes a small input to log today's weight. Pre-seeds with current profile weight.

Summary stat cards at the top: total calories this week, total workouts, average daily protein, current streak.

**3. Add "Analytics" to navigation**
- Update `Sidebar.tsx` and `BottomTabs.tsx`: add `{ id: 'analytics', icon: TrendingUp, label: 'Analytics' }` to `navItems`.
- Update `Index.tsx`: import `AnalyticsPage` and add to the `pages` record.

**4. Update `src/lib/store.ts`**
Add weight history helpers:
- `getWeightHistory(): {date: string, weight: number}[]`
- `addWeightEntry(weight: number)`

### Technical Notes
- All data sourced from existing localStorage keys — no backend needed.
- Recharts components: `AreaChart`, `BarChart`, `LineChart` with `ResponsiveContainer`.
- Charts use the app's existing color tokens (gold, teal, coral, purple-accent).
- Responsive layout: stacked on mobile, 2-column grid on desktop.

