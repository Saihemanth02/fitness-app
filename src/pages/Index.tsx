import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import BottomTabs from '@/components/BottomTabs';
import { AppProvider } from '@/components/AppContext';
import { WorkoutProvider } from '@/components/WorkoutContext';
import FloatingWorkoutTimer from '@/components/FloatingWorkoutTimer';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardPage from '@/pages/DashboardPage';
import WorkoutPage from '@/pages/WorkoutPage';
import NutritionPage from '@/pages/NutritionPage';
import CoachPage from '@/pages/CoachPage';
import PlanPage from '@/pages/PlanPage';
import ProfilePage from '@/pages/ProfilePage';
import AnalyticsPage from '@/pages/AnalyticsPage';

const pages: Record<string, React.FC> = {
  dashboard: DashboardPage,
  workout: WorkoutPage,
  nutrition: NutritionPage,
  coach: CoachPage,
  analytics: AnalyticsPage,
  plan: PlanPage,
  profile: ProfilePage,
};

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.98 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  duration: 0.35,
};

export default function Index() {
  const [activePage, setActivePage] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const { user } = useAuth();
  const PageComponent = pages[activePage] || DashboardPage;

  useEffect(() => {
    async function checkNewUser() {
      const { data } = await supabase.from('profiles').select('onboarded').eq('id', user!.id).single();
      setShowOnboarding(data?.onboarded === false);
      setCheckingOnboarding(false);
    }
    if (user) checkNewUser();
    else setCheckingOnboarding(false);
  }, [user]);

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';

  return (
    <AppProvider>
      <WorkoutProvider>
        {showOnboarding && !checkingOnboarding && (
          <OnboardingFlow userName={userName} onComplete={() => setShowOnboarding(false)} />
        )}
        <div className="flex h-screen overflow-hidden relative">
          <div className="orb orb-gold" />
          <div className="orb orb-teal" />
          <div className="orb orb-purple" />

          <Sidebar activePage={activePage} onNavigate={setActivePage} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <PageComponent />
              </motion.div>
            </AnimatePresence>
            <div className="text-center py-8 mt-8 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">
                FitGenius AI · Built by <span className="text-gold font-medium">Sai Hemanth · GVP MCA</span>
              </p>
            </div>
          </main>
          <BottomTabs activePage={activePage} onNavigate={setActivePage} />
          <FloatingWorkoutTimer />
        </div>
      </WorkoutProvider>
    </AppProvider>
  );
}
