import { useState } from 'react';
import { workouts } from '@/lib/workoutData';
import { useWorkout } from '@/components/WorkoutContext';
import { Play, Pause, RotateCcw, X, Minimize2 } from 'lucide-react';
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="glass-card w-full md:max-w-lg relative rounded-t-3xl md:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky header with Close & Minimize */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <p className="text-xs text-muted-foreground">Workout in progress</p>
              <div className="flex items-center gap-2">
                <button onClick={minimizeWorkout}
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Minimize — workout continues in background">
                  <Minimize2 size={16} />
                </button>
                <button onClick={closeWorkout}
                  className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                  title="Stop workout">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-6 pb-6 pt-2">

            <div className="text-center mb-6">
              <span className="text-4xl">{activeWorkout.emoji}</span>
              <h2 className="font-display text-2xl font-extrabold mt-2">{activeWorkout.name}</h2>
            </div>
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
            <div className="flex justify-center gap-4 mb-6">
              <button onClick={toggleRunning}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                {isRunning ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={resetWorkout}
                className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                <RotateCcw size={20} />
              </button>
            </div>
            <div className="space-y-2">
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
          </div>
        </div>
      )}
    </div>
  );
}
