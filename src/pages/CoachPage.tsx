import { useState, useRef, useEffect } from 'react';
import { store } from '@/lib/store';
import { Send, Brain } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const mlModels = [
  { name: 'ResNet-50 CNN', arch: 'TensorFlow', acc: '94.2%', status: 'Active' },
  { name: 'k-NN Collaborative', arch: 'Pearson k=15', acc: '91.8%', status: 'Active' },
  { name: 'Mifflin-St Jeor', arch: 'Linear Reg', acc: 'R²=0.91', status: 'Active' },
  { name: 'RL Plan Adapt', arch: 'Policy Gradient', acc: 'Ep.247', status: 'Training' },
  { name: 'BERT Food NLP', arch: 'Fine-tuned', acc: 'F1=0.89', status: 'Active' },
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm your FitGenius AI Coach 🧠 Ask me anything about fitness, nutrition, or your progress!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = store.getUser();
  const streak = store.getStreak();
  const foodLog = store.getFoodLog();
  const totalCals = foodLog.reduce((s, f) => s + f.calories, 0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const recoveryScore = Math.min(Math.round((7.5 / 8) * 100), 100);
  const bodyCompTrend = user.goal === 'Fat Loss' ? 'Trending down ↘' : user.goal === 'Muscle Gain' ? 'Gaining lean mass ↗' : 'Maintaining ↔';

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msgText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI response (Claude API would go here)
    setTimeout(() => {
      const responses = [
        `Great question, ${user.name}! Based on your ${streak.count}-day streak and ${totalCals} kcal intake today, you're ${totalCals < 1800 ? 'in a good caloric range. Keep it up!' : 'slightly above target. Consider a lighter dinner.'} 💪`,
        `${user.name}, your consistency is impressive with a ${streak.count}-day streak! For your ${user.goal.toLowerCase()} goal, try adding 10 min of walking after meals to boost metabolism. Your ${totalCals} kcal today looks ${totalCals < 2000 ? 'well-managed' : 'a bit high'}.`,
        `Looking at your data, ${user.name} — ${totalCals} kcal consumed today with a ${streak.count}-day streak. ${user.goal === 'Fat Loss' ? 'Stay in a 300-500 kcal deficit for steady progress.' : 'Make sure you hit your protein target for optimal results.'} Keep pushing! 🔥`,
      ];
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      }]);
      setIsLoading(false);
    }, 1200);
  };

  const chips = ["What should I eat tonight?", "Am I on track today?", "Suggest a recovery tip"];

  return (
    <div className="animate-fade-in h-full">
      <h1 className="font-display text-3xl font-extrabold mb-2">AI Coach <span className="text-gold">🤖</span></h1>
      <p className="text-muted-foreground text-sm mb-6">Your personal fitness AI, powered by your real data</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 h-[calc(100vh-220px)]">
        {/* Chat */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary p-4 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Chips */}
          <div className="px-6 pb-2 flex gap-2 flex-wrap">
            {chips.map(c => (
              <button key={c} onClick={() => sendMessage(c)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                {c}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your AI coach..."
                className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
              <button onClick={() => sendMessage()}
                className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4 overflow-y-auto">
          {/* ML Insights */}
          <div className="glass-card p-5">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2">
              <Brain size={16} className="text-purple-accent" /> ML Insights
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Body Composition</p>
                <p className="text-sm font-medium">{bodyCompTrend}</p>
                <div className="h-1.5 rounded-full bg-secondary mt-1.5 overflow-hidden">
                  <div className="h-full bg-teal rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recovery Score</p>
                <p className="text-sm font-medium">{recoveryScore}%</p>
                <div className="h-1.5 rounded-full bg-secondary mt-1.5 overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${recoveryScore}%` }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Personalization Model</p>
                <p className="text-sm font-medium text-purple-accent">ResNet-50 · 94.2%</p>
              </div>
            </div>
          </div>

          {/* ML Model Dashboard */}
          <div className="glass-card p-5">
            <h3 className="font-display font-bold mb-3">ML Models</h3>
            <div className="space-y-2">
              {mlModels.map(m => (
                <div key={m.name} className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-teal' : 'bg-gold animate-pulse'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.arch}</p>
                  </div>
                  <span className="text-[10px] text-purple-accent">{m.acc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
