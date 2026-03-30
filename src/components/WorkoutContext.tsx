import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { type WorkoutType } from '@/lib/workoutData';
import { addWorkout, incrementStreak, unlockBadge } from '@/lib/store';
import { useApp } from '@/components/AppContext';

interface WorkoutContextType {
  activeWorkout: WorkoutType | null;
  timeLeft: number;
  isRunning: boolean;
  currentExIdx: number;
  isMinimized: boolean;
  openWorkout: (w: WorkoutType) => void;
  toggleRunning: () => void;
  resetWorkout: () => void;
  closeWorkout: () => void;
  minimizeWorkout: () => void;
  maximizeWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextType>({
  activeWorkout: null, timeLeft: 420, isRunning: false, currentExIdx: 0, isMinimized: false,
  openWorkout: () => {}, toggleRunning: () => {}, resetWorkout: () => {},
  closeWorkout: () => {}, minimizeWorkout: () => {}, maximizeWorkout: () => {},
});

export const useWorkout = () => useContext(WorkoutContext);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutType | null>(null);
  const [timeLeft, setTimeLeft] = useState(420);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const { showToast, triggerRefresh } = useApp();
  const activeWorkoutRef = useRef(activeWorkout);
  activeWorkoutRef.current = activeWorkout;

  const completeWorkout = useCallback(async () => {
    const workout = activeWorkoutRef.current;
    if (!workout) return;
    setIsRunning(false);
    await addWorkout({
      type: workout.name,
      duration: 7,
      caloriesBurned: workout.kcal,
      completedAt: Date.now(),
    });
    const s = await incrementStreak();
    if (await unlockBadge('firstWorkout')) showToast('🏆 Badge: First Workout!');
    if (s.count >= 7 && await unlockBadge('streak7')) showToast('🏆 Badge: 7-Day Streak!');
    if (s.count >= 10 && await unlockBadge('streak10')) showToast('🏆 Badge: 10-Day Streak!');
    showToast(`🎉 ${workout.name} Complete! +${workout.kcal} kcal burned`);
    triggerRefresh();
    setActiveWorkout(null);
    setTimeLeft(420);
    setCurrentExIdx(0);
    setIsMinimized(false);
  }, [showToast, triggerRefresh]);

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
  }, [isRunning, completeWorkout]);

  useEffect(() => {
    if (activeWorkout) {
      const elapsed = 420 - timeLeft;
      setCurrentExIdx(Math.min(Math.floor(elapsed / 84), 4));
    }
  }, [timeLeft, activeWorkout]);

  const openWorkout = useCallback((w: WorkoutType) => {
    setActiveWorkout(w);
    setTimeLeft(420);
    setIsRunning(false);
    setCurrentExIdx(0);
    setIsMinimized(false);
  }, []);

  const toggleRunning = useCallback(() => setIsRunning(r => !r), []);

  const resetWorkout = useCallback(() => {
    setTimeLeft(420);
    setIsRunning(false);
    setCurrentExIdx(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const closeWorkout = useCallback(() => {
    setActiveWorkout(null);
    setIsRunning(false);
    setTimeLeft(420);
    setCurrentExIdx(0);
    setIsMinimized(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const minimizeWorkout = useCallback(() => setIsMinimized(true), []);
  const maximizeWorkout = useCallback(() => setIsMinimized(false), []);

  return (
    <WorkoutContext.Provider value={{
      activeWorkout, timeLeft, isRunning, currentExIdx, isMinimized,
      openWorkout, toggleRunning, resetWorkout, closeWorkout, minimizeWorkout, maximizeWorkout,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}
