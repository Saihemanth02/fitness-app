import { useState } from 'react';
import { workouts } from '@/lib/workoutData';
import { useWorkout } from '@/components/WorkoutContext';
import { Play, Pause, RotateCcw, X, Minimize2, Trophy, Flame, Clock, Zap } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function WorkoutPage() {
  const {
    activeWorkout, timeLeft, isRunning, currentExIdx, isMinimized,
    openWorkout, toggleRunning, resetWorkout, closeWorkout, minimizeWorkout, maximizeWorkout,
  } = useWorkout();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {workouts.map(w => (
          <button key={w.id} onClick={() => openWorkout(w)} className="glass-card-hover p-6 text-left">
            <div className="text-4xl mb-3">{w.emoji}</div>
            <h3 className="font-display text-lg font-bold">{w.name}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span>{w.duration}</span><span>·</span><span>{w.kcal} kcal</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${difficultyColor(w.difficultyColor)}`}>{w.difficulty}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Full Workout Modal */}
      {activeWorkout && !isMinimized && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 pt-6 pb-4">
              {/* Emoji + Title */}
              <div className="text-center mb-6">
                <span className="text-5xl">{activeWorkout.emoji}</span>
                <h2 className="font-display text-2xl font-extrabold mt-3">{activeWorkout.name}</h2>
              </div>

              {/* Timer ring */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg width="160" height="160" className="-rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                      strokeDasharray={timerCircumference} strokeDashoffset={timerProgress} strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-3xl font-bold">{mins}:{secs.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground">remaining</span>
                  </div>
                </div>
              </div>

              {/* Play / Reset controls */}
              <div className="flex justify-center gap-4 mb-6">
                <button onClick={toggleRunning}
                  className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg">
                  {isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button onClick={resetWorkout}
                  className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                  <RotateCcw size={20} />
                </button>
              </div>

              {/* Exercise list */}
              <div className="space-y-2 mb-2">
                {activeWorkout.exercises.map((ex, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    i === currentExIdx ? 'bg-primary/15 border border-primary/30' : 'border border-transparent'
                  }`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === currentExIdx ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>{i + 1}</span>
                    <span className={`text-sm ${i === currentExIdx ? 'font-semibold' : ''}`}>{ex.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{ex.duration || `${ex.sets}×${ex.reps}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky bottom action bar */}
            <div className="border-t border-border px-6 py-4 flex gap-3">
              <button onClick={minimizeWorkout}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary hover:bg-muted text-sm font-semibold transition-colors">
                <Minimize2 size={16} />
                Minimize
              </button>
              <button onClick={() => setShowCloseConfirm(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25 text-sm font-semibold transition-colors">
                <X size={16} />
                Stop Workout
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be lost. You can minimize instead to keep it running in the background.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { closeWorkout(); setShowCloseConfirm(false); }}
            >
              Stop workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
