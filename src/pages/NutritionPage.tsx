import { useState, useEffect, useMemo, useRef } from 'react';
import { foodDatabase, alternatives, type FoodEntry } from '@/lib/foodDatabase';
import { getFoodLog, getAllFoodLogs, addFoodItem, removeFoodItem, unlockBadge, type FoodItem } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/components/AppContext';
import { Search, Plus, X, Upload, Brain, Camera, Type, ArrowRight } from 'lucide-react';

interface AIPrediction extends FoodEntry {
  confidence: number;
  alternative?: { name: string; reason: string };
}

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-food`;

export default function NutritionPage() {
  const { showToast, triggerRefresh, refreshKey } = useApp();
  const [search, setSearch] = useState('');
  const [foodLog, setFoodLog] = useState<FoodItem[]>([]);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [analyzerMode, setAnalyzerMode] = useState<'photo' | 'text'>('photo');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFoodLog().then(setFoodLog);
  }, [refreshKey]);

  const filtered = search.length > 0
    ? foodDatabase.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const totals = useMemo(() => ({
    calories: foodLog.reduce((s, f) => s + f.calories, 0),
    protein: foodLog.reduce((s, f) => s + f.protein, 0),
    carbs: foodLog.reduce((s, f) => s + f.carbs, 0),
    fat: foodLog.reduce((s, f) => s + f.fat, 0),
  }), [foodLog]);

  const addFood = async (f: FoodEntry) => {
    await addFoodItem({
      name: f.name, emoji: f.emoji,
      calories: f.calories, protein: f.protein,
      carbs: f.carbs, fat: f.fat,
      label: f.healthLabel,
    });
    const updated = await getFoodLog();
    setFoodLog(updated);
    setSearch('');
    const unlocked = await unlockBadge('firstFood');
    if (unlocked) showToast('🏆 Badge: First Food Log!');
    triggerRefresh();
  };

  const removeFood = async (id: string) => {
    await removeFoodItem(id);
    const updated = await getFoodLog();
    setFoodLog(updated);
    triggerRefresh();
  };

  const addPrediction = () => {
    if (!prediction) return;
    addFood({
      emoji: prediction.emoji,
      name: prediction.name,
      calories: prediction.calories,
      protein: prediction.protein,
      carbs: prediction.carbs,
      fat: prediction.fat,
      healthLabel: prediction.healthLabel,
    });
    setPrediction(null);
    setPreviewUrl(null);
    showToast('✅ AI-analyzed food added to log!');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPrediction(null);
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const imageBase64 = await base64Promise;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('Please log in to use the food analyzer', 'warning');
        setIsProcessing(false);
        return;
      }
      const resp = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ imageBase64 }),
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        showToast(errorData.error || `Analysis failed (${resp.status})`, 'warning');
        setIsProcessing(false);
        return;
      }
      const result = await resp.json();
      setPrediction({
        name: result.name || 'Unknown Food', emoji: result.emoji || '🍽️',
        calories: Math.round(result.calories || 0), protein: Math.round(result.protein || 0),
        carbs: Math.round(result.carbs || 0), fat: Math.round(result.fat || 0),
        healthLabel: result.healthLabel || 'Moderate', confidence: result.confidence || 0,
        alternative: result.alternative,
      });
    } catch (err) {
      console.error('Food analysis error:', err);
      showToast('Failed to analyze food photo. Please try again.', 'warning');
    }
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create a synthetic event-like object to reuse handleFileSelect logic
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
      handleFileSelect({ target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleTextAnalyze = async () => {
    if (!textQuery.trim()) return;
    setPrediction(null);
    setPreviewUrl(null);
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('Please log in to use the food analyzer', 'warning');
        setIsProcessing(false);
        return;
      }
      const resp = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ foodText: textQuery.trim() }),
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        showToast(errorData.error || `Analysis failed (${resp.status})`, 'warning');
        setIsProcessing(false);
        return;
      }
      const result = await resp.json();
      setPrediction({
        name: result.name || 'Unknown Food', emoji: result.emoji || '🍽️',
        calories: Math.round(result.calories || 0), protein: Math.round(result.protein || 0),
        carbs: Math.round(result.carbs || 0), fat: Math.round(result.fat || 0),
        healthLabel: result.healthLabel || 'Moderate', confidence: result.confidence || 0,
        alternative: result.alternative,
      });
      setTextQuery('');
    } catch (err) {
      console.error('Food text analysis error:', err);
      showToast('Failed to analyze food. Please try again.', 'warning');
    }
    setIsProcessing(false);
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

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">Today's Food Log</h3>
            {foodLog.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No food logged yet. Search and add above!</p>
            ) : (
              <div className="space-y-2">
                {foodLog.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border transition-colors">
                    <span className="text-xl">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{f.name}</span>
                      <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span>{f.calories} kcal</span><span>P:{f.protein}g</span><span>C:{f.carbs}g</span><span>F:{f.fat}g</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${labelColor(f.label)}`}>{f.label}</span>
                    <button onClick={() => removeFood(f.id)} className="text-muted-foreground hover:text-coral transition-colors"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-purple-accent" />
              <h3 className="font-display text-lg font-bold">AI Food Analyzer</h3>
            </div>
            {/* Mode toggle */}
            <div className="flex rounded-xl bg-secondary p-1 mb-4">
              <button onClick={() => setAnalyzerMode('photo')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  analyzerMode === 'photo' ? 'bg-purple-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <Camera size={14} /> Photo
              </button>
              <button onClick={() => setAnalyzerMode('text')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  analyzerMode === 'text' ? 'bg-purple-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <Type size={14} /> Text
              </button>
            </div>
            {isProcessing && (
              <div className="mt-4">
                {previewUrl && <img src={previewUrl} alt="Analyzing..." className="w-full h-32 object-cover rounded-xl mb-3 opacity-70" />}
                <div className="shimmer h-6 rounded-lg mb-2" /><div className="shimmer h-4 rounded-lg w-3/4 mb-2" /><div className="shimmer h-4 rounded-lg w-1/2" />
                <p className="text-xs text-purple-accent mt-3 text-center animate-pulse">🔬 AI analyzing your food...</p>
              </div>
            )}
            {prediction && !isProcessing && (
              <div className="mt-4 space-y-3">
                {previewUrl && <img src={previewUrl} alt={prediction.name} className="w-full h-32 object-cover rounded-xl" />}
                <div className="glass-card p-4 border-purple-accent/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{prediction.emoji}</span>
                    <div>
                      <p className="font-display font-bold text-lg">{prediction.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden max-w-[80px]">
                          <div className="h-full bg-purple-accent rounded-full transition-all duration-700" style={{ width: `${prediction.confidence}%` }} />
                        </div>
                        <p className="text-[10px] text-purple-accent">{prediction.confidence}% confidence</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                    <div><p className="font-bold text-gold">{prediction.calories}</p><p className="text-muted-foreground">kcal</p></div>
                    <div><p className="font-bold text-teal">{prediction.protein}g</p><p className="text-muted-foreground">protein</p></div>
                    <div><p className="font-bold">{prediction.carbs}g</p><p className="text-muted-foreground">carbs</p></div>
                    <div><p className="font-bold text-coral">{prediction.fat}g</p><p className="text-muted-foreground">fat</p></div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${labelColor(prediction.healthLabel)}`}>{prediction.healthLabel}</span>
                  {prediction.alternative && (
                    <div className="mt-3 p-2.5 rounded-lg bg-secondary/50">
                      <p className="text-[10px] text-muted-foreground mb-0.5">💡 Healthier swap</p>
                      <p className="text-xs"><span className="text-teal font-medium">{prediction.alternative.name}</span><span className="text-muted-foreground"> — {prediction.alternative.reason}</span></p>
                    </div>
                  )}
                  <button onClick={addPrediction}
                    className="w-full mt-3 bg-purple-accent text-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    <Plus size={16} /> Add to Log
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-bold mb-4">🧠 Smart Swaps</h3>
            <p className="text-[10px] text-purple-accent mb-3">AI-powered healthier alternatives</p>
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
