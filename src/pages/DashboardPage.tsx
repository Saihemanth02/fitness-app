import { useState, useEffect, useMemo } from 'react';
import { store } from '@/lib/store';
import { useApp } from '@/components/AppContext';
import { Flame, Footprints, Dumbbell, Droplets, Moon } from 'lucide-react';

export default function DashboardPage() {
  const { refreshKey } = useApp();
  const [steps, setSteps] = useState(store.getSteps());
  const [water, setWater] = useState(store.getWater());
  const { showToast, triggerRefresh } = useApp();
  const user = store.getUser();
  const streak = store.getStreak();
  const foodLog = store.getFoodLog();

  const totalCals = foodLog.reduce((s, f) => s + f.calories, 0);
  const totalProtein = foodLog.reduce((s, f) => s + f.protein, 0);
  const totalCarbs = foodLog.reduce((s, f) => s + f.carbs, 0);
  const totalFat = foodLog.reduce((s, f) => s + f.fat, 0);
  const caloriesBurned = store.getTodayCaloriesBurned();
  const filledGlasses = water.glasses.filter(Boolean).length;
  const hydration = (filledGlasses * 0.25).toFixed(2);

  // Calorie target
  const bmr = useMemo(() => {
    const w = user.weight, h = user.height, a = user.age;
    return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  }, [user]);
  const actMultiplier = user.activityLevel === 'Sedentary' ? 1.2 : user.activityLevel === 'Light' ? 1.375 : user.activityLevel === 'Active' ? 1.725 : 1.55;
  const calorieTarget = Math.round(bmr * actMultiplier);

  // Step simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newSteps = store.getSteps() + Math.floor(Math.random() * 50 + 10);
      store.setSteps(newSteps);
      setSteps(newSteps);
      if (newSteps >= 10000) {
        if (store.unlockBadge('steps10k')) {
          showToast('🏆 Badge Unlocked: 10K Steps!');
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [showToast]);

  const toggleGlass = (i: number) => {
    const w = { ...water, glasses: [...water.glasses] };
    w.glasses[i] = !w.glasses[i];
    store.setWater(w);
    setWater(w);
    triggerRefresh();
  };

  const calPercent = Math.min((totalCals / calorieTarget) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekActivity = useMemo(() => {
    const workouts = store.getWorkouts();
    const now = new Date();
    return dayLabels.map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + i);
      const ds = d.toISOString().split('T')[0];
      const dayWorkouts = workouts.filter(w => new Date(w.completedAt).toISOString().split('T')[0] === ds);
      return Math.min(dayWorkouts.length * 35 + (Math.random() * 20), 100);
    });
  }, [refreshKey]);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const workoutStatus = caloriesBurned > 0 ? 'Done ✅' : 'Not Started';

  const stats = [
    { icon: Flame, label: 'Calories Burned', value: caloriesBurned, unit: 'kcal', color: 'text-coral' },
    { icon: Footprints, label: 'Steps Today', value: steps.toLocaleString(), unit: '', color: 'text-teal' },
    { icon: Dumbbell, label: "Today's Workout", value: workoutStatus, unit: '', color: 'text-gold' },
    { icon: Droplets, label: 'Hydration', value: hydration, unit: 'L', color: 'text-teal' },
    { icon: Moon, label: 'Sleep Score', value: '7.5', unit: 'hrs', color: 'text-purple-accent' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold">
            Hey, <span className="text-gold">{user.name}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{todayStr}</p>
        </div>
        <div className="glass-card px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-display text-xl font-bold text-gold">{streak.count}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Donut + Macros */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Calorie Intake</h3>
            <div className="flex items-center gap-8">
              {/* Donut */}
              <div className="relative">
                <svg width="130" height="130" className="-rotate-90">
                  <circle cx="65" cy="65" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                  <circle
                    cx="65" cy="65" r="54" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-xl font-bold">{totalCals}</span>
                  <span className="text-[10px] text-muted-foreground">/ {calorieTarget}</span>
                </div>
              </div>
              {/* Macros */}
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
                      <div
                        className={`h-full rounded-full ${m.color} transition-all duration-800`}
                        style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Weekly Activity</h3>
            <div className="flex items-end gap-3 h-32">
              {dayLabels.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-secondary rounded-lg overflow-hidden relative" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-primary/60 rounded-lg transition-all duration-700"
                      style={{ height: `${weekActivity[i]}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Water Tracker */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Water Tracker 💧</h3>
            <div className="grid grid-cols-4 gap-3">
              {water.glasses.map((filled, i) => (
                <button
                  key={i}
                  onClick={() => toggleGlass(i)}
                  className={`h-16 rounded-xl border-2 transition-all duration-300 flex items-center justify-center text-2xl ${
                    filled
                      ? 'bg-teal/20 border-teal'
                      : 'border-border hover:border-teal/50'
                  }`}
                >
                  {filled ? '💧' : '🥛'}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              {filledGlasses}/8 glasses ({hydration}L)
            </p>
          </div>

          {/* Today's Workout Preview */}
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
