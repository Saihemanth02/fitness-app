// localStorage persistence layer for FitGenius AI

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  label: string;
  timestamp: number;
}

export interface WorkoutLog {
  type: string;
  duration: number;
  caloriesBurned: number;
  completedAt: number;
}

export interface StreakData {
  count: number;
  lastWorkoutDate: string;
}

export interface WaterData {
  glasses: boolean[];
  date: string;
}

export interface Badges {
  firstWorkout: boolean;
  streak7: boolean;
  streak10: boolean;
  steps10k: boolean;
  firstFood: boolean;
  planGenerated: boolean;
}

export interface WeekPlanDay {
  day: string;
  workout: string;
  emoji: string;
}

export interface MealItem {
  emoji: string;
  name: string;
  calories: number;
}

export interface PlanData {
  weekPlan: WeekPlanDay[];
  mealPlan: { breakfast: MealItem; lunch: MealItem; snack: MealItem; dinner: MealItem };
  generatedAt: number;
}

const today = () => new Date().toISOString().split('T')[0];

function load<T>(key: string, fallback: T): T {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const store = {
  getUser: (): UserProfile => load('fitgenius_user', {
    name: 'Hemanth', age: 24, height: 175, weight: 72,
    goal: 'Fat Loss', activityLevel: 'Moderate'
  }),
  setUser: (u: UserProfile) => save('fitgenius_user', u),

  getStreak: (): StreakData => load('fitgenius_streak', { count: 0, lastWorkoutDate: '' }),
  setStreak: (s: StreakData) => save('fitgenius_streak', s),

  getFoodLog: (): FoodItem[] => {
    const items = load<FoodItem[]>('fitgenius_foodlog', []);
    return items.filter(i => new Date(i.timestamp).toISOString().split('T')[0] === today());
  },
  setFoodLog: (f: FoodItem[]) => save('fitgenius_foodlog', f),
  getAllFoodLogs: (): FoodItem[] => load('fitgenius_foodlog', []),

  getWater: (): WaterData => {
    const w = load<WaterData>('fitgenius_water', { glasses: Array(8).fill(false), date: today() });
    if (w.date !== today()) return { glasses: Array(8).fill(false), date: today() };
    return w;
  },
  setWater: (w: WaterData) => save('fitgenius_water', w),

  getWorkouts: (): WorkoutLog[] => load('fitgenius_workouts', []),
  addWorkout: (w: WorkoutLog) => {
    const all = load<WorkoutLog[]>('fitgenius_workouts', []);
    all.push(w);
    save('fitgenius_workouts', all);
  },

  getBadges: (): Badges => load('fitgenius_badges', {
    firstWorkout: false, streak7: false, streak10: false,
    steps10k: false, firstFood: false, planGenerated: false
  }),
  setBadges: (b: Badges) => save('fitgenius_badges', b),

  getPlan: (): PlanData | null => load<PlanData | null>('fitgenius_plan', null),
  setPlan: (p: PlanData) => save('fitgenius_plan', p),

  getSteps: (): number => {
    const d = load<{ steps: number; date: string }>('fitgenius_steps', { steps: 0, date: today() });
    if (d.date !== today()) return 0;
    return d.steps;
  },
  setSteps: (s: number) => save('fitgenius_steps', { steps: s, date: today() }),

  getTodayCaloriesBurned: (): number => {
    const workouts = load<WorkoutLog[]>('fitgenius_workouts', []);
    return workouts
      .filter(w => new Date(w.completedAt).toISOString().split('T')[0] === today())
      .reduce((sum, w) => sum + w.caloriesBurned, 0);
  },

  incrementStreak: () => {
    const s = store.getStreak();
    const t = today();
    if (s.lastWorkoutDate === t) return s;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    const newCount = (s.lastWorkoutDate === yStr || s.count === 0) ? s.count + 1 : 1;
    const updated = { count: newCount, lastWorkoutDate: t };
    store.setStreak(updated);
    return updated;
  },

  unlockBadge: (key: keyof Badges): boolean => {
    const b = store.getBadges();
    if (b[key]) return false;
    b[key] = true;
    store.setBadges(b);
    return true;
  },

  getWeightHistory: (): { date: string; weight: number }[] => {
    return load('fitgenius_weight_history', []);
  },
  addWeightEntry: (weight: number) => {
    const history = load<{ date: string; weight: number }[]>('fitgenius_weight_history', []);
    const t = today();
    const idx = history.findIndex(h => h.date === t);
    if (idx >= 0) history[idx].weight = weight;
    else history.push({ date: t, weight });
    save('fitgenius_weight_history', history);
  },
};
