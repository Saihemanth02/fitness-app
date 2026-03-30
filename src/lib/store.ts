// Supabase-backed persistence layer for FitGenius AI
import { supabase } from '@/integrations/supabase/client';

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

// Helper to get current user id
async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// ─── Profile ───
export async function getProfile(): Promise<UserProfile> {
  const userId = await getUserId();
  if (!userId) return { name: '', age: 24, height: 175, weight: 72, goal: 'Fat Loss', activityLevel: 'Moderate' };
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!data) return { name: '', age: 24, height: 175, weight: 72, goal: 'Fat Loss', activityLevel: 'Moderate' };
  return {
    name: data.name || '',
    age: data.age ?? 24,
    height: Number(data.height) || 175,
    weight: Number(data.weight) || 72,
    goal: data.goal || 'Fat Loss',
    activityLevel: data.activity_level || 'Moderate',
  };
}

export async function setProfile(u: UserProfile): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from('profiles').update({
    name: u.name,
    age: u.age,
    height: u.height,
    weight: u.weight,
    goal: u.goal,
    activity_level: u.activityLevel,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
}

// ─── Food Logs ───
export async function getFoodLog(): Promise<FoodItem[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', startOfDay.toISOString())
    .order('logged_at', { ascending: true });
  return (data || []).map(d => ({
    id: d.id,
    name: d.name,
    emoji: d.emoji || '🍽️',
    calories: d.calories || 0,
    protein: d.protein || 0,
    carbs: d.carbs || 0,
    fat: d.fat || 0,
    label: d.label || 'Moderate',
    timestamp: new Date(d.logged_at!).getTime(),
  }));
}

export async function getAllFoodLogs(): Promise<FoodItem[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: true });
  return (data || []).map(d => ({
    id: d.id,
    name: d.name,
    emoji: d.emoji || '🍽️',
    calories: d.calories || 0,
    protein: d.protein || 0,
    carbs: d.carbs || 0,
    fat: d.fat || 0,
    label: d.label || 'Moderate',
    timestamp: new Date(d.logged_at!).getTime(),
  }));
}

export async function addFoodItem(item: Omit<FoodItem, 'id' | 'timestamp'>): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from('food_logs').insert({
    user_id: userId,
    name: item.name,
    emoji: item.emoji,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    label: item.label,
  });
}

export async function removeFoodItem(id: string): Promise<void> {
  await supabase.from('food_logs').delete().eq('id', id);
}

// ─── Workouts ───
export async function getWorkouts(): Promise<WorkoutLog[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: true });
  return (data || []).map(d => ({
    type: d.type,
    duration: d.duration || 7,
    caloriesBurned: d.calories_burned || 0,
    completedAt: new Date(d.completed_at!).getTime(),
  }));
}

export async function addWorkout(w: WorkoutLog): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from('workouts').insert({
    user_id: userId,
    type: w.type,
    duration: w.duration,
    calories_burned: w.caloriesBurned,
    completed_at: new Date(w.completedAt).toISOString(),
  });
}

export async function getTodayCaloriesBurned(): Promise<number> {
  const userId = await getUserId();
  if (!userId) return 0;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from('workouts')
    .select('calories_burned')
    .eq('user_id', userId)
    .gte('completed_at', startOfDay.toISOString());
  return (data || []).reduce((sum, w) => sum + (w.calories_burned || 0), 0);
}

// ─── Streak ───
export async function getStreak(): Promise<StreakData> {
  const userId = await getUserId();
  if (!userId) return { count: 0, lastWorkoutDate: '' };
  const { data } = await supabase.from('streaks').select('*').eq('user_id', userId).single();
  if (!data) return { count: 0, lastWorkoutDate: '' };
  return { count: data.count || 0, lastWorkoutDate: data.last_workout_date || '' };
}

export async function incrementStreak(): Promise<StreakData> {
  const userId = await getUserId();
  if (!userId) return { count: 0, lastWorkoutDate: '' };
  const s = await getStreak();
  const t = today();
  if (s.lastWorkoutDate === t) return s;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  const newCount = (s.lastWorkoutDate === yStr || s.count === 0) ? s.count + 1 : 1;
  await supabase.from('streaks').update({ count: newCount, last_workout_date: t }).eq('user_id', userId);
  return { count: newCount, lastWorkoutDate: t };
}

// ─── Water ───
export async function getWater(): Promise<WaterData> {
  const userId = await getUserId();
  const t = today();
  if (!userId) return { glasses: Array(8).fill(false), date: t };
  const { data } = await supabase.from('water_logs').select('*').eq('user_id', userId).eq('date', t).single();
  if (!data) return { glasses: Array(8).fill(false), date: t };
  // Store glasses count as integer, convert to boolean array
  const count = data.glasses || 0;
  const glasses = Array(8).fill(false).map((_, i) => i < count);
  return { glasses, date: t };
}

export async function setWater(w: WaterData): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const count = w.glasses.filter(Boolean).length;
  const { data } = await supabase.from('water_logs').select('id').eq('user_id', userId).eq('date', w.date).single();
  if (data) {
    await supabase.from('water_logs').update({ glasses: count }).eq('id', data.id);
  } else {
    await supabase.from('water_logs').insert({ user_id: userId, glasses: count, date: w.date });
  }
}

// ─── Badges ───
export async function getBadges(): Promise<Badges> {
  const userId = await getUserId();
  if (!userId) return { firstWorkout: false, streak7: false, streak10: false, steps10k: false, firstFood: false, planGenerated: false };
  const { data } = await supabase.from('badges').select('*').eq('user_id', userId).single();
  if (!data) return { firstWorkout: false, streak7: false, streak10: false, steps10k: false, firstFood: false, planGenerated: false };
  return {
    firstWorkout: data.first_workout || false,
    streak7: data.streak7 || false,
    streak10: data.streak10 || false,
    steps10k: data.steps10k || false,
    firstFood: data.first_food || false,
    planGenerated: data.plan_generated || false,
  };
}

export async function unlockBadge(key: keyof Badges): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const b = await getBadges();
  if (b[key]) return false;
  const columnMap: Record<keyof Badges, string> = {
    firstWorkout: 'first_workout',
    streak7: 'streak7',
    streak10: 'streak10',
    steps10k: 'steps10k',
    firstFood: 'first_food',
    planGenerated: 'plan_generated',
  };
  await supabase.from('badges').update({ [columnMap[key]]: true }).eq('user_id', userId);
  return true;
}

// ─── Weight History ───
export async function getWeightHistory(): Promise<{ date: string; weight: number }[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  return (data || []).map(d => ({ date: d.date!, weight: Number(d.weight) }));
}

export async function addWeightEntry(weight: number): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const t = today();
  const { data } = await supabase.from('weight_history').select('id').eq('user_id', userId).eq('date', t).single();
  if (data) {
    await supabase.from('weight_history').update({ weight }).eq('id', data.id);
  } else {
    await supabase.from('weight_history').insert({ user_id: userId, weight, date: t });
  }
}

// ─── Goals ───
export interface GoalsData {
  dailyCalories: number;
  targetWeight: number | null;
  weeklyWorkouts: number;
}

export async function getGoals(): Promise<GoalsData> {
  const userId = await getUserId();
  if (!userId) return { dailyCalories: 2000, targetWeight: null, weeklyWorkouts: 4 };
  const { data } = await supabase.from('goals').select('*').eq('user_id', userId).single();
  if (!data) return { dailyCalories: 2000, targetWeight: null, weeklyWorkouts: 4 };
  return {
    dailyCalories: (data as any).daily_calories ?? 2000,
    targetWeight: (data as any).target_weight ? Number((data as any).target_weight) : null,
    weeklyWorkouts: (data as any).weekly_workouts ?? 4,
  };
}

export async function setGoals(g: GoalsData): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  const { data } = await supabase.from('goals').select('id').eq('user_id', userId).single();
  const payload = {
    daily_calories: g.dailyCalories,
    target_weight: g.targetWeight,
    weekly_workouts: g.weeklyWorkouts,
    updated_at: new Date().toISOString(),
  };
  if (data) {
    await supabase.from('goals').update(payload).eq('user_id', userId);
  } else {
    await supabase.from('goals').insert({ user_id: userId, ...payload });
  }
}

// ─── Steps (localStorage only - no table) ───
export function getSteps(): number {
  try {
    const d = JSON.parse(localStorage.getItem('fitgenius_steps') || '{}');
    if (d.date !== today()) return 0;
    return d.steps || 0;
  } catch { return 0; }
}

export function setSteps(s: number): void {
  localStorage.setItem('fitgenius_steps', JSON.stringify({ steps: s, date: today() }));
}

// ─── Plan (localStorage - could be migrated later) ───
export function getPlan(): PlanData | null {
  try {
    const d = localStorage.getItem('fitgenius_plan');
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

export function setPlan(p: PlanData): void {
  localStorage.setItem('fitgenius_plan', JSON.stringify(p));
}

// Legacy synchronous store for compatibility during migration
export const store = {
  getUser: (): UserProfile => {
    try {
      const d = localStorage.getItem('fitgenius_user_cache');
      return d ? JSON.parse(d) : { name: '', age: 24, height: 175, weight: 72, goal: 'Fat Loss', activityLevel: 'Moderate' };
    } catch { return { name: '', age: 24, height: 175, weight: 72, goal: 'Fat Loss', activityLevel: 'Moderate' }; }
  },
  setUser: (u: UserProfile) => localStorage.setItem('fitgenius_user_cache', JSON.stringify(u)),
  getSteps,
  setSteps,
  getPlan,
  setPlan,
};
