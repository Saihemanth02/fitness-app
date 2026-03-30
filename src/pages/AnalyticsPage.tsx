import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Flame, Dumbbell, Zap, Scale } from 'lucide-react';
import { store } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const card = 'bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-4 md:p-6';

function getLast7Days() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function shortDay(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' });
}

export default function AnalyticsPage() {
  const days = getLast7Days();
  const allFood = store.getAllFoodLogs();
  const allWorkouts = store.getWorkouts();
  const weightHistory = store.getWeightHistory();
  const profile = store.getUser();

  const [weightInput, setWeightInput] = useState('');

  // Calorie trend data
  const calorieData = useMemo(() => days.map(day => {
    const consumed = allFood
      .filter(f => new Date(f.timestamp).toISOString().split('T')[0] === day)
      .reduce((s, f) => s + f.calories, 0);
    const burned = allWorkouts
      .filter(w => new Date(w.completedAt).toISOString().split('T')[0] === day)
      .reduce((s, w) => s + w.caloriesBurned, 0);
    return { day: shortDay(day), consumed, burned };
  }), [days, allFood, allWorkouts]);

  // Workout frequency data
  const workoutData = useMemo(() => days.map(day => {
    const dayWorkouts = allWorkouts.filter(
      w => new Date(w.completedAt).toISOString().split('T')[0] === day
    );
    return { day: shortDay(day), count: dayWorkouts.length };
  }), [days, allWorkouts]);

  // Weight chart data
  const weightData = useMemo(() => {
    if (weightHistory.length === 0) {
      return [{ date: shortDay(new Date().toISOString().split('T')[0]), weight: profile.weight }];
    }
    return weightHistory.slice(-14).map(e => ({ date: shortDay(e.date), weight: e.weight }));
  }, [weightHistory, profile.weight]);

  // Summary stats
  const weekCalories = calorieData.reduce((s, d) => s + d.consumed, 0);
  const weekWorkouts = workoutData.reduce((s, d) => s + d.count, 0);
  const avgProtein = Math.round(
    allFood.filter(f => {
      const d = new Date(f.timestamp).toISOString().split('T')[0];
      return days.includes(d);
    }).reduce((s, f) => s + f.protein, 0) / 7
  );
  const streak = store.getStreak().count;

  const handleLogWeight = () => {
    const w = parseFloat(weightInput);
    if (!w || w < 20 || w > 300) return;
    store.addWeightEntry(w);
    setWeightInput('');
    window.location.reload();
  };

  const statCards = [
    { label: 'Week Calories', value: weekCalories.toLocaleString(), icon: Flame, color: 'text-coral' },
    { label: 'Workouts', value: weekWorkouts, icon: Dumbbell, color: 'text-gold' },
    { label: 'Avg Protein/Day', value: `${avgProtein}g`, icon: Zap, color: 'text-accent' },
    { label: 'Streak', value: `${streak} days`, icon: TrendingUp, color: 'text-purple-accent' },
  ];

  const tooltipStyle = {
    contentStyle: { background: 'hsl(222 60% 10%)', border: '1px solid hsl(222 20% 15%)', borderRadius: '12px', fontSize: '12px' },
    labelStyle: { color: 'hsl(222 20% 55%)' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.h1
        className="text-2xl md:text-3xl font-display font-extrabold text-foreground"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📊 Progress Analytics
      </motion.h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className={card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={16} className={s.color} />
              <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-xl md:text-2xl font-display font-extrabold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calorie trend */}
        <motion.div className={card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-sm font-display font-bold text-foreground mb-4">🔥 Weekly Calorie Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 15%)" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(222 20% 55%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(222 20% 55%)', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="consumed" stroke="hsl(44 90% 61%)" fill="hsl(44 90% 61% / 0.2)" strokeWidth={2} name="Consumed" />
              <Area type="monotone" dataKey="burned" stroke="hsl(0 100% 71%)" fill="hsl(0 100% 71% / 0.15)" strokeWidth={2} name="Burned" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground font-body">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold inline-block" /> Consumed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-coral inline-block" /> Burned</span>
          </div>
        </motion.div>

        {/* Workout frequency */}
        <motion.div className={card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-display font-bold text-foreground mb-4">💪 Workout Frequency</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 15%)" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(222 20% 55%)', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'hsl(222 20% 55%)', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="hsl(168 100% 45%)" radius={[6, 6, 0, 0]} name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weight tracker */}
        <motion.div className={`${card} lg:col-span-2`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <Scale size={16} className="text-purple-accent" /> Weight Tracker
            </h2>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Log weight (kg)"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                className="w-36 h-8 text-xs bg-secondary/50 border-border/50"
              />
              <Button size="sm" onClick={handleLogWeight} className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/80">
                Log
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 15%)" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(222 20% 55%)', fontSize: 11 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'hsl(222 20% 55%)', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="weight" stroke="hsl(258 90% 66%)" strokeWidth={2.5} dot={{ fill: 'hsl(258 90% 66%)', r: 4 }} name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
