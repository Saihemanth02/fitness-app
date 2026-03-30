import { useWorkout } from '@/components/WorkoutContext';
import { Play, Pause, X, Maximize2 } from 'lucide-react';

export default function FloatingWorkoutTimer() {
  const { activeWorkout, timeLeft, isRunning, isMinimized, toggleRunning, closeWorkout, maximizeWorkout } = useWorkout();

  if (!activeWorkout || !isMinimized) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((420 - timeLeft) / 420) * 100;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 glass-card p-3 flex items-center gap-3 shadow-2xl border-primary/30 min-w-[220px] animate-fade-in">
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-secondary overflow-hidden">
        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>

      <span className="text-xl">{activeWorkout.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display font-bold truncate">{activeWorkout.name}</p>
        <p className="text-sm font-display font-bold text-gold">{mins}:{secs.toString().padStart(2, '0')}</p>
      </div>

      <button onClick={toggleRunning}
        className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button onClick={maximizeWorkout}
        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
        <Maximize2 size={14} />
      </button>
      <button onClick={closeWorkout}
        className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}
