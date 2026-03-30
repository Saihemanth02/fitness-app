import { useState, useRef, useEffect } from 'react';
import { store } from '@/lib/store';
import { Send, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitness-coach`;

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm your FitGenius AI Coach 🧠 Ask me anything about fitness, nutrition, or your progress!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
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
    if (!msgText || isLoading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msgText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Build chat history (skip first welcome message)
    const chatHistory = updatedMessages
      .slice(1)
      .map(m => ({ role: m.role, content: m.content }));

    const userContext = {
      name: user.name,
      goal: user.goal,
      activityLevel: user.activityLevel,
      caloriesEaten: totalCals,
      streak: streak.count,
      weight: user.weight,
      height: user.height,
      age: user.age,
    };

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatHistory, userContext }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const errorMsg = errorData.error || `Error ${resp.status}`;
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errorMsg}` }]);
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              if (!assistantSoFar) setIsStreaming(true);
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1 && last !== updatedMessages[0]) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m);
                }
                return [...prev, { role: 'assistant', content: currentContent }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m);
                }
                return [...prev, { role: 'assistant', content: currentContent }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    }

    setIsLoading(false);
    setIsStreaming(false);
  };

  const chips = ["What should I eat tonight?", "Am I on track today?", "Suggest a recovery tip"];

  return (
    <div className="animate-fade-in h-full">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-2">AI Coach <span className="text-gold">🤖</span></h1>
      <p className="text-muted-foreground text-sm mb-4 md:mb-6">Your personal fitness AI, powered by your real data</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 md:gap-6 h-[calc(100vh-240px)] md:h-[calc(100vh-220px)]">
        {/* Chat */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && !isStreaming && (
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
              <button key={c} onClick={() => sendMessage(c)} disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
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
                disabled={isLoading}
                className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground disabled:opacity-50" />
              <button onClick={() => sendMessage()} disabled={isLoading}
                className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50">
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
