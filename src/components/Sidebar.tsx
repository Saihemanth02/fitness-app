import { useState } from 'react';
import { LayoutDashboard, Dumbbell, Apple, Bot, CalendarDays, User } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'workout', icon: Dumbbell, label: 'Workout' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition' },
  { id: 'coach', icon: Bot, label: 'AI Coach' },
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
    <aside className="w-20 h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-1 shrink-0">
      <div className="mb-6 text-2xl font-display font-extrabold text-gold">
        FG
      </div>
      {navItems.map(item => {
        const isActive = activePage === item.id;
        const isHovered = hoveredItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
              isActive
                ? 'bg-primary/15 text-gold'
                : isHovered
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[9px] font-body font-medium">{item.label}</span>
          </button>
        );
      })}
      <div className="mt-auto text-muted-foreground text-[8px] font-body text-center leading-tight">
        FitGenius<br/>AI
      </div>
    </aside>
  );
}
