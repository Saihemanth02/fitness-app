import { useState, useEffect, useMemo } from 'react';
import { getProfile, getFoodLog, getStreak, getWater, setWater as saveWater, getWorkouts, getTodayCaloriesBurned, unlockBadge, getSteps, setSteps, type UserProfile, type FoodItem, type StreakData, type WaterData, type WorkoutLog } from '@/lib/store';
import { useApp } from '@/components/AppContext';
import { Flame, Footprints, Dumbbell, Droplets, Moon } from 'lucide-react';

export default function DashboardPage() {
  const { refreshKey, showToast, triggerRefresh } = useApp();
  const [user, setUser] = useState<UserProfile>({ name: '', age: 24, height: 175, weight: 72, goal: 'Fat Loss', activityLevel: 'Moderate' });
  const [steps, setStepsState] = useState(0);
  const [water, setWaterState] = useState<WaterData>({ glasses: Array(8).fill(false), date: '' });
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastWorkoutDate: '' });
  const [foodLog, setFoodLog] = useState<FoodItem[]>([]);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, f, s, w, cb, wk] = await Promise.all([
        getProfile(), getFoodLog(), getStreak(), getWater(), getTodayCaloriesBurned(), getWorkouts()
      ]);
      setUser(u); setFoodLog(f); setStreak(s); setWaterState(w); setCaloriesBurned(cb); setAllWorkouts(wk);
      setStepsState(getSteps());
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  const totalCals = foodLog.reduce((s, f) => s + f.calories, 0);
  const totalProtein = foodLog.reduce((s, f) => s + f.protein, 0);
  const totalCarbs = foodLog.reduce((s, f) => s + f.carbs, 0);
  const totalFat = foodLog.reduce((s, f) => s + f.fat, 0);
  const filledGlasses = water.glasses.filter(Boolean).length;
  const hydration = (filledGlasses * 0.25).toFixed(2);

  const bmr = useMemo(() => Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5), [user]);
  const actMultiplier = user.activityLevel === 'Sedentary' ? 1.2 : user.activityLevel === 'Light' ? 1.375 : user.activityLevel === 'Active' ? 1.725 : 1.55;
  const calorieTarget = Math.round(bmr * actMultiplier);

  useEffect(() => {
    const interval = setInterval(() => {
      const newSteps = getSteps() + Math.floor(Math.random() * 50 + 10);
      setSteps(newSteps);
      setStepsState(newSteps);
      if (newSteps >= 10000) {
        unlockBadge('steps10k').then(unlocked => {
          if (unlocked) showToast('🏆 Badge Unlocked: 10K Steps!');
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [showToast]);

  const toggleGlass = async (i: number) => {
    const w = { ...water, glasses: [...water.glasses] };
    w.glasses[i] = !w.glasses[i];
    setWaterState(w);
    await saveWater(w);
    triggerRefresh();
  };

  const calPercent = Math.min((totalCals / calorieTarget) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekActivity = useMemo(() => {
    const now = new Date();
    return dayLabels.map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + i);
      const ds = d.toISOString().split('T')[0];
      const dayWorkouts = allWorkouts.filter(w => new Date(w.completedAt).toISOString().split('T')[0] === ds);
      return Math.min(dayWorkouts.length * 35 + (Math.random() * 20), 100);
    });
  }, [allWorkouts, refreshKey]);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const workoutStatus = caloriesBurned > 0 ? 'Done ✅' : 'Not Started';

  const stats = [
    { icon: Flame, label: 'Calories Burned', value: caloriesBurned, unit: 'kcal', color: 'text-coral' },
    { icon: Footprints, label: 'Steps Today', value: steps.toLocaleString(), unit: '', color: 'text-teal' },
    { icon: Dumbbell, label: "Today's Workout", value: workoutStatus, unit: '', color: 'text-gold' },
    { icon: Droplets, label: 'Hydration', value: hydration, unit: 'L', color: 'text-teal' },
    { icon: Moon, label: 'Sleep Score', value: '7.5', unit: 'hrs', color: 'text-purple-accent' },
  ];

  if (loading) return <div className="animate-fade-in text-center py-20 text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold truncate">
            Hey, <span className="text-gold">{user.name || 'there'}</span> 👋
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">{todayStr}</p>
        </div>
        <div className="glass-card px-3 md:px-5 py-2 md:py-3 flex items-center gap-2 md:gap-3 shrink-0">
          <span className="text-xl md:text-2xl">🔥</span>
          <div>
            <p className="font-display text-lg md:text-xl font-bold text-gold">{streak.count}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((s, i) => (
          <div key={i} className="glass-card-hover p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <p className={`font-display text-xl font-bold ${s.color}`}>
              {s.value}{s.unit && <span className="text-xs ml-1 font-body">{s.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 md:gap-6">
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Calorie Intake</h3>
            <div className="flex items-center gap-8">
              <div className="relative">
                <svg width="130" height="130" className="-rotate-90">
                  <circle cx="65" cy="65" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                  <circle cx="65" cy="65" r="54" fill="none" stroke="hsl(var(--primary))" strokeWidth="10"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-xl font-bold">{totalCals}</span>
                  <span className="text-[10px] text-muted-foreground">/ {calorieTarget}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Protein', value: totalProtein, max: Math.round(user.weight * 0.8 * 2), color: 'bg-teal' },
                  { label: 'Carbs', value: totalCarbs, max: Math.round(calorieTarget * 0.45 / 4), color: 'bg-gold' },
                  { label: 'Fat', value: totalFat, max: Math.round(calorieTarget * 0.25 / 9), color: 'bg-coral' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-medium">{m.value}g / {m.max}g</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${m.color} transition-all duration-800`}
                        style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Weekly Activity</h3>
            <div className="flex items-end gap-3 h-32">
              {dayLabels.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-secondary rounded-lg overflow-hidden relative" style={{ height: '100px' }}>
                    <div className="absolute bottom-0 w-full bg-primary/60 rounded-lg transition-all duration-700"
                      style={{ height: `${weekActivity[i]}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Water Tracker 💧</h3>
            <div className="grid grid-cols-4 gap-3">
              {water.glasses.map((filled, i) => (
                <button key={i} onClick={() => toggleGlass(i)}
                  className={`h-16 rounded-xl border-2 transition-all duration-300 flex items-center justify-center text-2xl ${
                    filled ? 'bg-teal/20 border-teal' : 'border-border hover:border-teal/50'
                  }`}>
                  {filled ? '💧' : '🥛'}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              {filledGlasses}/8 glasses ({hydration}L)
            </p>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Today's Workout 💪</h3>
            <div className="space-y-2">
              {['Jumping Jacks', 'Burpees', 'Plank Hold', 'Mountain Climbers', 'Squat Jumps'].map((ex, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <span className="text-gold font-display text-sm font-bold">{i + 1}</span>
                  <span className="text-sm">{ex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
