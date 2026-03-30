import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { type WorkoutType } from '@/lib/workoutData';
import { addWorkout, incrementStreak, unlockBadge } from '@/lib/store';
import { useApp } from '@/components/AppContext';

interface CompletedWorkoutData {
  workout: WorkoutType;
  streakCount: number;
  badgesEarned: string[];
}

interface WorkoutContextType {
  activeWorkout: WorkoutType | null;
  timeLeft: number;
  isRunning: boolean;
  currentExIdx: number;
  isMinimized: boolean;
  completedData: CompletedWorkoutData | null;
  openWorkout: (w: WorkoutType) => void;
  toggleRunning: () => void;
  resetWorkout: () => void;
  closeWorkout: () => void;
  minimizeWorkout: () => void;
  maximizeWorkout: () => void;
  dismissCompletion: () => void;
}

const WorkoutContext = createContext<WorkoutContextType>({
  activeWorkout: null, timeLeft: 420, isRunning: false, currentExIdx: 0, isMinimized: false,
  completedData: null,
  openWorkout: () => {}, toggleRunning: () => {}, resetWorkout: () => {},
  closeWorkout: () => {}, minimizeWorkout: () => {}, maximizeWorkout: () => {},
  dismissCompletion: () => {},
});

export const useWorkout = () => useContext(WorkoutContext);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutType | null>(null);
  const [timeLeft, setTimeLeft] = useState(420);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [completedData, setCompletedData] = useState<CompletedWorkoutData | null>(null);
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
    const badges: string[] = [];
    if (await unlockBadge('firstWorkout')) badges.push('🏆 First Workout!');
    if (s.count >= 7 && await unlockBadge('streak7')) badges.push('🏆 7-Day Streak!');
    if (s.count >= 10 && await unlockBadge('streak10')) badges.push('🏆 10-Day Streak!');
    badges.forEach(b => showToast(b));
    triggerRefresh();

    setCompletedData({ workout, streakCount: s.count, badgesEarned: badges });
    setActiveWorkout(null);
    setTimeLeft(420);
    setCurrentExIdx(0);
    setIsMinimized(false);
  }, [showToast, triggerRefresh]);

  const dismissCompletion = useCallback(() => setCompletedData(null), []);

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
    setCompletedData(null);
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
      activeWorkout, timeLeft, isRunning, currentExIdx, isMinimized, completedData,
      openWorkout, toggleRunning, resetWorkout, closeWorkout, minimizeWorkout, maximizeWorkout, dismissCompletion,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}
