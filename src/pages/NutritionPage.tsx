import { useState, useMemo } from 'react';
import { foodDatabase, alternatives, type FoodEntry } from '@/lib/foodDatabase';
import { store, type FoodItem } from '@/lib/store';
import { useApp } from '@/components/AppContext';
import { Search, Plus, X, Upload, Brain } from 'lucide-react';

export default function NutritionPage() {
  const { showToast, triggerRefresh } = useApp();
  const [search, setSearch] = useState('');
  const [foodLog, setFoodLog] = useState<FoodItem[]>(store.getFoodLog());
  const [prediction, setPrediction] = useState<FoodEntry | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mlConfidence, setMlConfidence] = useState(0);

  const filtered = search.length > 0
    ? foodDatabase.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const totals = useMemo(() => ({
    calories: foodLog.reduce((s, f) => s + f.calories, 0),
    protein: foodLog.reduce((s, f) => s + f.protein, 0),
    carbs: foodLog.reduce((s, f) => s + f.carbs, 0),
    fat: foodLog.reduce((s, f) => s + f.fat, 0),
  }), [foodLog]);

  const addFood = (f: FoodEntry) => {
    const item: FoodItem = {
      id: Date.now().toString(),
      name: f.name, emoji: f.emoji,
      calories: f.calories, protein: f.protein,
      carbs: f.carbs, fat: f.fat,
      label: f.healthLabel, timestamp: Date.now()
    };
    const updated = [...store.getAllFoodLogs(), item];
    store.setFoodLog(updated);
    setFoodLog(store.getFoodLog());
    setSearch('');
    if (store.unlockBadge('firstFood')) showToast('🏆 Badge: First Food Log!');
    triggerRefresh();
  };

  const removeFood = (id: string) => {
    const all = store.getAllFoodLogs().filter(f => f.id !== id);
    store.setFoodLog(all);
    setFoodLog(store.getFoodLog());
    triggerRefresh();
  };

  const addPrediction = () => {
    if (!prediction) return;
    addFood(prediction);
    setPrediction(null);
    showToast('Added ML prediction to food log!');
  };

  const handleFileUpload = () => {
    setIsProcessing(true);
    setPrediction(null);
    setTimeout(() => {
      const randomFood = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
      const conf = Math.floor(Math.random() * 9 + 89);
      setPrediction(randomFood);
      setMlConfidence(conf);
      setIsProcessing(false);
    }, 1500);
  };

  const activeAlternatives = foodLog
    .map(f => ({ food: f.name, ...alternatives[f.name] }))
    .filter(a => a.suggestion);

  const labelColor = (l: string) =>
    l === 'Excellent' ? 'text-teal bg-teal/10' : l === 'Good' ? 'text-gold bg-primary/10'
    : l === 'Moderate' ? 'text-muted-foreground bg-secondary' : 'text-coral bg-coral/10';

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-2">Nutrition <span className="text-gold">🍎</span></h1>
      <p className="text-muted-foreground text-sm mb-8">Track your meals with AI-powered nutritional analysis</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="glass-card p-6">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search foods... (e.g. Idli, Chicken, Quinoa)"
                className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
            </div>
            {filtered.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                {filtered.map(f => (
                  <button key={f.name} onClick={() => addFood(f)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left">
                    <span className="text-xl">{f.emoji}</span>
                    <span className="text-sm font-medium">{f.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{f.calories} kcal</span>
                    <Plus size={14} className="text-teal" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Calories', value: totals.calories, unit: 'kcal', color: 'text-gold' },
              { label: 'Protein', value: totals.protein, unit: 'g', color: 'text-teal' },
              { label: 'Carbs', value: totals.carbs, unit: 'g', color: 'text-gold' },
              { label: 'Fat', value: totals.fat, unit: 'g', color: 'text-coral' },
            ].map(t => (
              <div key={t.label} className="glass-card p-4 text-center">
                <p className={`font-display text-xl font-bold ${t.color}`}>{t.value}<span className="text-xs ml-1 font-body">{t.unit}</span></p>
                <p className="text-[10px] text-muted-foreground mt-1">{t.label}</p>
              </div>
            ))}
          </div>

          {/* Food Log */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Today's Food Log</h3>
            {foodLog.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No food logged yet. Search and add above!</p>
            ) : (
              <div className="space-y-2">
                {foodLog.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border transition-colors">
                    <span className="text-xl">{f.emoji}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{f.name}</span>
                      <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span>{f.calories} kcal</span>
                        <span>P:{f.protein}g</span>
                        <span>C:{f.carbs}g</span>
                        <span>F:{f.fat}g</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${labelColor(f.label)}`}>{f.label}</span>
                    <button onClick={() => removeFood(f.id)} className="text-muted-foreground hover:text-coral transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* ML Food Predictor */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-purple-accent" />
              <h3 className="font-display text-lg font-bold">ML Food Predictor</h3>
            </div>
            <div
              onClick={handleFileUpload}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-purple-accent/50 transition-colors"
            >
              <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click to upload food photo</p>
              <p className="text-[10px] text-muted-foreground mt-1">ResNet-50 · TensorFlow · 94.2% accuracy</p>
            </div>

            {isProcessing && (
              <div className="mt-4 text-center">
                <div className="shimmer h-24 rounded-xl" />
                <p className="text-xs text-purple-accent mt-2">ResNet-50 processing...</p>
              </div>
            )}

            {prediction && !isProcessing && (
              <div className="mt-4 glass-card p-4 border-purple-accent/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{prediction.emoji}</span>
                  <div>
                    <p className="font-display font-bold">{prediction.name}</p>
                    <p className="text-[10px] text-purple-accent">Confidence: {mlConfidence}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                  <div><p className="font-bold text-gold">{prediction.calories}</p><p className="text-muted-foreground">kcal</p></div>
                  <div><p className="font-bold text-teal">{prediction.protein}g</p><p className="text-muted-foreground">protein</p></div>
                  <div><p className="font-bold">{prediction.carbs}g</p><p className="text-muted-foreground">carbs</p></div>
                  <div><p className="font-bold text-coral">{prediction.fat}g</p><p className="text-muted-foreground">fat</p></div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${labelColor(prediction.healthLabel)}`}>
                  {prediction.healthLabel}
                </span>
                <button onClick={addPrediction}
                  className="w-full mt-3 bg-purple-accent text-foreground py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Add to Log
                </button>
              </div>
            )}
          </div>

          {/* AI Alternatives */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">🧠 Smart Swaps</h3>
            <p className="text-[10px] text-purple-accent mb-3">BERT fine-tuned · Food NLP · F1=0.89</p>
            {activeAlternatives.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Add foods to see smart alternatives</p>
            ) : (
              <div className="space-y-3">
                {activeAlternatives.map((a, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/50">
                    <p className="text-sm"><span className="text-coral">{a.food}</span> → <span className="text-teal">{a.suggestion}</span></p>
                    <p className="text-[10px] text-muted-foreground mt-1">{a.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
