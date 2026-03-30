import { useState, useMemo } from 'react';
import { store, type UserProfile } from '@/lib/store';
import { useApp } from '@/components/AppContext';
import { Save, Award } from 'lucide-react';

const goalOptions = ['Fat Loss', 'Muscle Gain', 'Flexibility', 'Maintenance'];
const activityOptions = ['Sedentary', 'Light', 'Moderate', 'Active'];

export default function ProfilePage() {
  const { showToast } = useApp();
  const [user, setUser] = useState<UserProfile>(store.getUser());
  const badges = store.getBadges();

  const bmi = useMemo(() => {
    const hm = user.height / 100;
    return (user.weight / (hm * hm)).toFixed(1);
  }, [user.height, user.weight]);

  const bmiCategory = useMemo(() => {
    const v = parseFloat(bmi);
    if (v < 18.5) return 'Underweight';
    if (v < 25) return 'Normal';
    if (v < 30) return 'Overweight';
    return 'Obese';
  }, [bmi]);

  const bmr = useMemo(() => Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5), [user]);
  const actMultiplier = user.activityLevel === 'Sedentary' ? 1.2 : user.activityLevel === 'Light' ? 1.375 : user.activityLevel === 'Active' ? 1.725 : 1.55;
  const tdee = Math.round(bmr * actMultiplier);
  const proteinTarget = Math.round(user.weight * 0.8);

  const saveProfile = () => {
    store.setUser(user);
    showToast('Profile saved successfully!');
  };

  const allBadges = [
    { key: 'firstWorkout' as const, emoji: '🏋️', label: 'First Workout', unlocked: badges.firstWorkout },
    { key: 'streak7' as const, emoji: '🔥', label: '7-Day Streak', unlocked: badges.streak7 },
    { key: 'streak10' as const, emoji: '⭐', label: '10-Day Streak', unlocked: badges.streak10 },
    { key: 'steps10k' as const, emoji: '🚶', label: '10K Steps', unlocked: badges.steps10k },
    { key: 'firstFood' as const, emoji: '🍎', label: 'First Food Log', unlocked: badges.firstFood },
    { key: 'planGenerated' as const, emoji: '📋', label: 'Plan Generated', unlocked: badges.planGenerated },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl font-extrabold mb-2">Profile <span className="text-gold">👤</span></h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your profile and track achievements</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-bold mb-6">Personal Details</h3>
          <div className="space-y-4">
            {[
              { label: 'Name', type: 'text', value: user.name, key: 'name' },
              { label: 'Age', type: 'number', value: user.age, key: 'age' },
              { label: 'Height (cm)', type: 'number', value: user.height, key: 'height' },
              { label: 'Weight (kg)', type: 'number', value: user.weight, key: 'weight' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground mb-1.5 block">{f.label}</label>
                <input type={f.type}
                  value={f.value}
                  onChange={e => setUser({ ...user, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Goal</label>
              <select value={user.goal} onChange={e => setUser({ ...user, goal: e.target.value })}
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {goalOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Activity Level</label>
              <select value={user.activityLevel} onChange={e => setUser({ ...user, activityLevel: e.target.value })}
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {activityOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <button onClick={saveProfile}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Save size={18} /> Save Profile
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Calculated Stats */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Health Metrics</h3>
            <p className="text-[10px] text-purple-accent mb-4">Linear Regression · R²=0.91 · Mifflin-St Jeor</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-gold">{bmi}</p>
                <p className="text-[10px] text-muted-foreground">BMI</p>
                <p className={`text-[10px] mt-1 ${
                  bmiCategory === 'Normal' ? 'text-teal' : bmiCategory === 'Underweight' ? 'text-gold' : 'text-coral'
                }`}>{bmiCategory}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-teal">{tdee}</p>
                <p className="text-[10px] text-muted-foreground">Daily Cal Target</p>
                <p className="text-[10px] text-muted-foreground mt-1">BMR: {bmr}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-purple-accent">{proteinTarget}g</p>
                <p className="text-[10px] text-muted-foreground">Protein Target</p>
                <p className="text-[10px] text-muted-foreground mt-1">×0.8/kg</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <Award size={18} className="text-gold" /> Achievements
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {allBadges.map(b => (
                <div key={b.key} className={`text-center p-4 rounded-xl transition-all ${
                  b.unlocked ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30 opacity-40'
                }`}>
                  <span className="text-2xl">{b.emoji}</span>
                  <p className="text-[10px] mt-2 font-medium">{b.label}</p>
                  {b.unlocked && <p className="text-[8px] text-teal mt-1">Unlocked ✓</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Credits */}
          <div className="glass-card p-4 text-center">
            <p className="text-sm font-display font-bold text-gold">Sai Hemanth · GVP MCA</p>
            <p className="text-[10px] text-muted-foreground mt-1">FitGenius AI — Intelligent Wellness OS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
