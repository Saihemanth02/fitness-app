import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Dumbbell, Apple, Bot, CalendarDays, User, TrendingUp } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'workout', icon: Dumbbell, label: 'Workout' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition' },
  { id: 'coach', icon: Bot, label: 'AI Coach' },
  { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
  { id: 'plan', icon: CalendarDays, label: 'Plan' },
  { id: 'profile', icon: User, label: 'Profile' },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="hidden md:flex w-20 h-screen bg-sidebar border-r border-sidebar-border flex-col items-center py-6 gap-1 shrink-0">
      <motion.div
        className="mb-6 text-2xl font-display font-extrabold text-gold"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        FG
      </motion.div>
      {navItems.map(item => {
        const isActive = activePage === item.id;
        const isHovered = hoveredItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors duration-200 relative"
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl bg-primary/15"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <item.icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
              className={`relative z-10 transition-colors duration-200 ${
                isActive ? 'text-gold' : isHovered ? 'text-foreground' : 'text-muted-foreground'
              }`}
            />
            <span className={`text-[9px] font-body font-medium relative z-10 transition-colors duration-200 ${
              isActive ? 'text-gold' : isHovered ? 'text-foreground' : 'text-muted-foreground'
            }`}>{item.label}</span>
          </button>
        );
      })}
      <div className="mt-auto text-muted-foreground text-[8px] font-body text-center leading-tight">
        FitGenius<br/>AI
      </div>
    </aside>
  );
}
