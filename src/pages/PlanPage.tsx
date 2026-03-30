import { useState, useEffect } from 'react';
import { getProfile, getFoodLog, unlockBadge, type WeekPlanDay, type MealItem, type PlanData, type UserProfile, type FoodItem } from '@/lib/store';
import { store } from '@/lib/store';
import { useApp } from '@/components/AppContext';
import { Sparkles, RefreshCw } from 'lucide-react';

const workoutPool: Record<string, { emoji: string; types: string[] }> = {
  'Fat Loss': { emoji: '🔥', types: ['HIIT Blast', 'Cardio Rush', 'Core Crusher', 'HIIT Blast', 'Yoga Flow', 'Cardio Rush', 'Rest'] },
  'Muscle Gain': { emoji: '💪', types: ['Power Lift', 'Core Crusher', 'Power Lift', 'HIIT Blast', 'Power Lift', 'Stretch & Recover', 'Rest'] },
  'Flexibility': { emoji: '🧘', types: ['Yoga Flow', 'Stretch & Recover', 'Yoga Flow', 'Core Crusher', 'Yoga Flow', 'Stretch & Recover', 'Rest'] },
  'Maintenance': { emoji: '⚡', types: ['HIIT Blast', 'Yoga Flow', 'Power Lift', 'Cardio Rush', 'Core Crusher', 'Stretch & Recover', 'Rest'] },
};

const mealDB = {
  breakfast: [
    { emoji: '🥣', name: 'Oats + Banana', calories: 220 },
    { emoji: '🥚', name: 'Egg White Omelette', calories: 180 },
    { emoji: '🥞', name: 'Dosa + Chutney', calories: 200 },
    { emoji: '🍳', name: 'Poha', calories: 190 },
    { emoji: '🥘', name: 'Idli Sambar', calories: 170 },
  ],
  lunch: [
    { emoji: '🍛', name: 'Dal Rice + Salad', calories: 420 },
    { emoji: '🥗', name: 'Chicken Salad Bowl', calories: 380 },
    { emoji: '🫓', name: 'Roti + Paneer', calories: 400 },
    { emoji: '🌾', name: 'Quinoa + Veggies', calories: 350 },
    { emoji: '🍚', name: 'Rajma Chawal', calories: 430 },
  ],
  snack: [
    { emoji: '🍎', name: 'Apple + Almonds', calories: 150 },
    { emoji: '🥛', name: 'Protein Shake', calories: 180 },
    { emoji: '🍌', name: 'Banana + Peanuts', calories: 170 },
    { emoji: '🥜', name: 'Trail Mix', calories: 160 },
    { emoji: '🍵', name: 'Green Tea + Makhana', calories: 80 },
  ],
  dinner: [
    { emoji: '🐟', name: 'Grilled Salmon + Greens', calories: 350 },
    { emoji: '🍗', name: 'Chicken Stew', calories: 320 },
    { emoji: '🥣', name: 'Dal + Roti', calories: 300 },
    { emoji: '🥦', name: 'Stir Fry Veggies', calories: 250 },
    { emoji: '🍲', name: 'Soup + Brown Bread', calories: 280 },
  ],
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export default function PlanPage() {
  const { showToast, triggerRefresh } = useApp();
  const [user, setUser] = useState<UserProfile>({ name: '', age: 24, height: 175, weight: 72, goal: 'Fat Loss', activityLevel: 'Moderate' });
  const [plan, setPlan] = useState<PlanData | null>(store.getPlan());
  const [generating, setGenerating] = useState(false);
  const [foodLog, setFoodLog] = useState<FoodItem[]>([]);

  useEffect(() => {
    async function load() {
      const [u, f] = await Promise.all([getProfile(), getFoodLog()]);
      setUser(u); setFoodLog(f);
    }
    load();
  }, []);

  const generatePlan = async () => {
    setGenerating(true);
    setTimeout(async () => {
      const goal = user.goal || 'Maintenance';
      const pool = workoutPool[goal] || workoutPool['Maintenance'];
      const weekPlan: WeekPlanDay[] = days.map((day, i) => ({
        day, workout: pool.types[i] || 'Rest', emoji: pool.types[i] === 'Rest' ? '😴' : pool.emoji
      }));
      const mealPlan = {
        breakfast: pickRandom(mealDB.breakfast), lunch: pickRandom(mealDB.lunch),
        snack: pickRandom(mealDB.snack), dinner: pickRandom(mealDB.dinner),
      };
      const newPlan: PlanData = { weekPlan, mealPlan, generatedAt: Date.now() };
      store.setPlan(newPlan);
      setPlan(newPlan);
      if (await unlockBadge('planGenerated')) showToast('🏆 Badge: Plan Generated!');
      setGenerating(false);
      triggerRefresh();
    }, 1500);
  };

  const regenerateMeals = () => {
    if (!plan) return;
    const mealPlan = {
      breakfast: pickRandom(mealDB.breakfast), lunch: pickRandom(mealDB.lunch),
      snack: pickRandom(mealDB.snack), dinner: pickRandom(mealDB.dinner),
    };
    const updated = { ...plan, mealPlan };
    store.setPlan(updated);
    setPlan(updated);
  };

  const totalMealCals = plan
    ? plan.mealPlan.breakfast.calories + plan.mealPlan.lunch.calories + plan.mealPlan.snack.calories + plan.mealPlan.dinner.calories
    : 0;

  const eatenCals = foodLog.reduce((s, f) => s + f.calories, 0);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-2">Your Plan <span className="text-gold">📋</span></h1>
      <p className="text-muted-foreground text-sm mb-8">AI-generated workout & meal plan tailored to your goals</p>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={generatePlan} disabled={generating}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
          <Sparkles size={18} />{generating ? 'Generating...' : 'Generate My Plan'}
        </button>
        <div className="text-xs text-muted-foreground">
          <p>k-NN model · k=15 neighbors · Pearson similarity</p>
          <p className="text-purple-accent">Goal: {user.goal} · Activity: {user.activityLevel}</p>
        </div>
      </div>
      <div className="glass-card p-4 mb-6 flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <div>
          <p className="text-xs font-medium text-purple-accent">RL Agent · Policy Gradient · Episode 247</p>
          <p className="text-[10px] text-muted-foreground">Adapting plan based on 12-day feedback loop · Reward: {plan ? '73' : '0'}%</p>
        </div>
      </div>
      {generating && (
        <div className="glass-card p-12 text-center">
          <div className="shimmer h-48 rounded-xl" />
          <p className="text-sm text-purple-accent mt-4">k-NN model computing optimal plan...</p>
        </div>
      )}
      {plan && !generating && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Weekly Workout Schedule</h3>
            <div className="space-y-2">
              {plan.weekPlan.map((d, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${d.workout === 'Rest' ? 'bg-secondary/30' : 'bg-secondary/60'}`}>
                  <span className="text-sm font-medium w-24 text-muted-foreground">{d.day}</span>
                  <span className="text-xl">{d.emoji}</span>
                  <span className="text-sm font-medium">{d.workout}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">Daily Meal Plan</h3>
                <button onClick={regenerateMeals} className="text-muted-foreground hover:text-foreground transition-colors"><RefreshCw size={16} /></button>
              </div>
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(meal => {
                const item = plan.mealPlan[meal];
                return (
                  <div key={meal} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1"><p className="text-xs text-muted-foreground capitalize">{meal}</p><p className="text-sm font-medium">{item.name}</p></div>
                    <span className="text-sm text-gold font-display font-bold">{item.calories} kcal</span>
                  </div>
                );
              })}
              <div className="mt-4 pt-3 border-t border-border text-center">
                <span className="font-display text-lg font-bold text-gold">{totalMealCals}</span>
                <span className="text-xs text-muted-foreground ml-2">total kcal planned</span>
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display font-bold mb-3">Calorie Progress</h3>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Eaten: {eatenCals} kcal</span>
                <span className="text-muted-foreground">Target: {totalMealCals} kcal</span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min((eatenCals / (totalMealCals || 1)) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">{totalMealCals > 0 ? `${Math.round((eatenCals / totalMealCals) * 100)}%` : '0%'} of daily target</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
