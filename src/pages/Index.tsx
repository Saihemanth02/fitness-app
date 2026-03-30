import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { AppProvider } from '@/components/AppContext';
import DashboardPage from '@/pages/DashboardPage';
import WorkoutPage from '@/pages/WorkoutPage';
import NutritionPage from '@/pages/NutritionPage';
import CoachPage from '@/pages/CoachPage';
import PlanPage from '@/pages/PlanPage';
import ProfilePage from '@/pages/ProfilePage';

const pages: Record<string, React.FC> = {
  dashboard: DashboardPage,
  workout: WorkoutPage,
  nutrition: NutritionPage,
  coach: CoachPage,
  plan: PlanPage,
  profile: ProfilePage,
};

export default function Index() {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = pages[activePage] || DashboardPage;

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden relative">
        {/* Background Orbs */}
        <div className="orb orb-gold" />
        <div className="orb orb-teal" />
        <div className="orb orb-purple" />

        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <PageComponent key={activePage} />
          {/* Footer */}
          <div className="text-center py-8 mt-8 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground">
              FitGenius AI · Built by <span className="text-gold font-medium">Sai Hemanth · GVP MCA</span>
            </p>
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
