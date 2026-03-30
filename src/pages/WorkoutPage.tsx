import { useState, useEffect, useRef } from 'react';
import { workouts, type WorkoutType } from '@/lib/workoutData';
import { store } from '@/lib/store';
import { useApp } from '@/components/AppContext';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

export default function WorkoutPage() {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutType | null>(null);
  const [timeLeft, setTimeLeft] = useState(420);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const { showToast, triggerRefresh } = useApp();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            completeWorkout();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  useEffect(() => {
    if (activeWorkout) {
      const elapsed = 420 - timeLeft;
      const idx = Math.min(Math.floor(elapsed / 84), 4);
      setCurrentExIdx(idx);
    }
  }, [timeLeft, activeWorkout]);

  const completeWorkout = () => {
    if (!activeWorkout) return;
    setIsRunning(false);
    store.addWorkout({
      type: activeWorkout.name,
      duration: 7,
      caloriesBurned: activeWorkout.kcal,
      completedAt: Date.now()
    });
    const s = store.incrementStreak();
    if (store.unlockBadge('firstWorkout')) showToast('🏆 Badge: First Workout!');
    if (s.count >= 7 && store.unlockBadge('streak7')) showToast('🏆 Badge: 7-Day Streak!');
    if (s.count >= 10 && store.unlockBadge('streak10')) showToast('🏆 Badge: 10-Day Streak!');
    showToast(`🎉 ${activeWorkout.name} Complete! +${activeWorkout.kcal} kcal burned`);
    triggerRefresh();
    setActiveWorkout(null);
    setTimeLeft(420);
    setCurrentExIdx(0);
  };

  const openWorkout = (w: WorkoutType) => {
    setActiveWorkout(w);
    setTimeLeft(420);
    setIsRunning(false);
    setCurrentExIdx(0);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerCircumference = 2 * Math.PI * 70;
  const timerProgress = timerCircumference - ((420 - timeLeft) / 420) * timerCircumference;

  const difficultyColor = (c: string) =>
    c === 'coral' ? 'text-coral bg-coral/10' : c === 'gold' ? 'text-gold bg-primary/10' : 'text-teal bg-teal/10';

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-2">Workouts <span className="text-gold">🏋️</span></h1>
      <p className="text-muted-foreground text-sm mb-8">7-minute high-intensity workouts designed for results</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {workouts.map(w => (
          <button key={w.id} onClick={() => openWorkout(w)} className="glass-card-hover p-6 text-left">
            <div className="text-4xl mb-3">{w.emoji}</div>
            <h3 className="font-display text-lg font-bold">{w.name}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span>{w.duration}</span>
              <span>·</span>
              <span>{w.kcal} kcal</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${difficultyColor(w.difficultyColor)}`}>
                {w.difficulty}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Workout Modal */}
      {activeWorkout && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-8 relative">
            <button onClick={() => { setActiveWorkout(null); setIsRunning(false); if (timerRef.current) clearInterval(timerRef.current); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <span className="text-4xl">{activeWorkout.emoji}</span>
              <h2 className="font-display text-2xl font-extrabold mt-2">{activeWorkout.name}</h2>
            </div>

            {/* Timer Ring */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="160" height="160" className="-rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                    strokeDasharray={timerCircumference} strokeDashoffset={timerProgress}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-bold">{mins}:{secs.toString().padStart(2, '0')}</span>
                  <span className="text-[10px] text-muted-foreground">remaining</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <button onClick={() => setIsRunning(!isRunning)}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                {isRunning ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={() => { setTimeLeft(420); setIsRunning(false); setCurrentExIdx(0); if (timerRef.current) clearInterval(timerRef.current); }}
                className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                <RotateCcw size={20} />
              </button>
            </div>

            {/* Exercise List */}
            <div className="space-y-2">
              {activeWorkout.exercises.map((ex, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  i === currentExIdx ? 'bg-primary/15 border border-primary/30' : 'border border-transparent'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === currentExIdx ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>{i + 1}</span>
                  <span className={`text-sm ${i === currentExIdx ? 'font-semibold' : ''}`}>{ex.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {ex.duration || `${ex.sets}×${ex.reps}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
