import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setProfile, type UserProfile } from '@/lib/store';
import { ChevronRight, ChevronLeft, User, Ruler, Weight, Target, Zap } from 'lucide-react';

const goalOptions = ['Fat Loss', 'Muscle Gain', 'Flexibility', 'Maintenance'];
const activityOptions = [
  { value: 'Sedentary', emoji: '🪑', desc: 'Little to no exercise' },
  { value: 'Light', emoji: '🚶', desc: '1-3 days/week' },
  { value: 'Moderate', emoji: '🏃', desc: '3-5 days/week' },
  { value: 'Active', emoji: '🔥', desc: '6-7 days/week' },
];

interface Props {
  userName: string;
  onComplete: () => void;
}

export default function OnboardingFlow({ userName, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfileState] = useState<UserProfile>({
    name: userName || '',
    age: 24,
    height: 175,
    weight: 72,
    goal: 'Fat Loss',
    activityLevel: 'Moderate',
  });

  const steps = [
    {
      title: 'What should we call you?',
      icon: User,
      content: (
        <div className="space-y-4">
          <input type="text" value={profile.name} placeholder="Your name"
            onChange={e => setProfileState(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-secondary rounded-xl px-4 py-3.5 text-center text-lg font-display font-bold focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      ),
    },
    {
      title: 'Tell us about yourself',
      icon: Ruler,
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Age</label>
            <input type="number" value={profile.age}
              onChange={e => setProfileState(p => ({ ...p, age: Math.max(10, Math.min(120, Number(e.target.value) || 24)) }))}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Height (cm)</label>
            <input type="number" value={profile.height}
              onChange={e => setProfileState(p => ({ ...p, height: Math.max(100, Math.min(250, Number(e.target.value) || 175)) }))}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Weight (kg)</label>
            <input type="number" value={profile.weight}
              onChange={e => setProfileState(p => ({ ...p, weight: Math.max(30, Math.min(300, Number(e.target.value) || 72)) }))}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
      ),
    },
    {
      title: "What's your goal?",
      icon: Target,
      content: (
        <div className="grid grid-cols-2 gap-3">
          {goalOptions.map(g => (
            <button key={g} onClick={() => setProfileState(p => ({ ...p, goal: g }))}
              className={`p-4 rounded-xl text-sm font-medium transition-all text-left ${
                profile.goal === g
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                  : 'bg-secondary hover:bg-muted'
              }`}>
              <span className="text-lg block mb-1">
                {g === 'Fat Loss' ? '🔥' : g === 'Muscle Gain' ? '💪' : g === 'Flexibility' ? '🧘' : '⚖️'}
              </span>
              {g}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'How active are you?',
      icon: Zap,
      content: (
        <div className="space-y-3">
          {activityOptions.map(a => (
            <button key={a.value} onClick={() => setProfileState(p => ({ ...p, activityLevel: a.value }))}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                profile.activityLevel === a.value
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                  : 'bg-secondary hover:bg-muted'
              }`}>
              <span className="text-2xl">{a.emoji}</span>
              <div>
                <p className="font-medium text-sm">{a.value}</p>
                <p className={`text-xs ${profile.activityLevel === a.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const isLastStep = step === steps.length - 1;
  const StepIcon = steps[step].icon;

  const handleNext = async () => {
    if (isLastStep) {
      await setProfile(profile);
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="orb orb-gold" />
      <div className="orb orb-teal" />

      <div className="w-full max-w-md relative z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-secondary'
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}>

            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <StepIcon size={20} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-extrabold">{steps[step].title}</h2>
              </div>

              {steps[step].content}

              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)}
                    className="px-4 py-3 rounded-xl bg-secondary hover:bg-muted transition-colors flex items-center gap-1 text-sm">
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
                <button onClick={handleNext}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  {isLastStep ? "Let's Go! 🚀" : 'Continue'} {!isLastStep && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {step === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Welcome to <span className="text-gold font-display font-bold">FitGenius AI</span> — let's personalize your experience
          </p>
        )}
      </div>
    </div>
  );
}
