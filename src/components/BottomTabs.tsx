import { motion } from 'framer-motion';
import { LayoutDashboard, Dumbbell, Apple, Bot, CalendarDays, User } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'workout', icon: Dumbbell, label: 'Workout' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition' },
  { id: 'coach', icon: Bot, label: 'Coach' },
  { id: 'plan', icon: CalendarDays, label: 'Plan' },
  { id: 'profile', icon: User, label: 'Profile' },
];

interface BottomTabsProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function BottomTabs({ activePage, onNavigate }: BottomTabsProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-xl relative min-w-0 flex-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-active"
                  className="absolute inset-0 rounded-xl bg-primary/15"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-gold' : 'text-muted-foreground'
                }`}
              />
              <span className={`text-[9px] font-body font-medium relative z-10 transition-colors duration-200 truncate ${
                isActive ? 'text-gold' : 'text-muted-foreground'
              }`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
