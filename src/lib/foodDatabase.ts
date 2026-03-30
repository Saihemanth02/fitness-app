export interface FoodEntry {
  emoji: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthLabel: string;
}

export const foodDatabase: FoodEntry[] = [
  { emoji: "🥘", name: "Idli", calories: 58, protein: 2, carbs: 12, fat: 0.4, healthLabel: "Excellent" },
  { emoji: "🥞", name: "Dosa", calories: 120, protein: 3, carbs: 18, fat: 4, healthLabel: "Good" },
  { emoji: "🍚", name: "Rice", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, healthLabel: "Moderate" },
  { emoji: "🫓", name: "Roti", calories: 71, protein: 3, carbs: 15, fat: 0.4, healthLabel: "Good" },
  { emoji: "🥣", name: "Dal", calories: 104, protein: 7, carbs: 18, fat: 0.4, healthLabel: "Excellent" },
  { emoji: "🍛", name: "Biryani", calories: 250, protein: 8, carbs: 35, fat: 9, healthLabel: "High Cal" },
  { emoji: "🧀", name: "Paneer", calories: 265, protein: 18, carbs: 1.2, fat: 21, healthLabel: "Good" },
  { emoji: "🥛", name: "Curd", calories: 60, protein: 3, carbs: 5, fat: 3, healthLabel: "Excellent" },
  { emoji: "🍌", name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, healthLabel: "Good" },
  { emoji: "🍎", name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, healthLabel: "Excellent" },
  { emoji: "🥚", name: "Egg", calories: 78, protein: 6, carbs: 0.6, fat: 5, healthLabel: "Excellent" },
  { emoji: "🍗", name: "Chicken", calories: 165, protein: 31, carbs: 0, fat: 3.6, healthLabel: "Excellent" },
  { emoji: "🐟", name: "Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, healthLabel: "Excellent" },
  { emoji: "🥣", name: "Oats", calories: 68, protein: 2.5, carbs: 12, fat: 1.4, healthLabel: "Excellent" },
  { emoji: "🥛", name: "Milk", calories: 42, protein: 3.4, carbs: 5, fat: 1, healthLabel: "Good" },
  { emoji: "🥜", name: "Almonds", calories: 576, protein: 21, carbs: 22, fat: 49, healthLabel: "Moderate" },
  { emoji: "🥜", name: "Peanuts", calories: 567, protein: 26, carbs: 16, fat: 49, healthLabel: "Moderate" },
  { emoji: "🥬", name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, healthLabel: "Excellent" },
  { emoji: "🥦", name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, healthLabel: "Excellent" },
  { emoji: "🍠", name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, healthLabel: "Good" },
  { emoji: "🌾", name: "Quinoa", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, healthLabel: "Excellent" },
  { emoji: "🥛", name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.7, healthLabel: "Excellent" },
  { emoji: "🍫", name: "Protein Bar", calories: 200, protein: 20, carbs: 22, fat: 7, healthLabel: "Good" },
  { emoji: "🍞", name: "Bread", calories: 265, protein: 9, carbs: 49, fat: 3.2, healthLabel: "Moderate" },
  { emoji: "🧈", name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, healthLabel: "High Cal" },
  { emoji: "🍊", name: "Orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, healthLabel: "Excellent" },
  { emoji: "🥭", name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, healthLabel: "Good" },
  { emoji: "🍉", name: "Watermelon", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, healthLabel: "Excellent" },
  { emoji: "☕", name: "Coffee", calories: 2, protein: 0.3, carbs: 0, fat: 0, healthLabel: "Excellent" },
  { emoji: "🍵", name: "Tea", calories: 1, protein: 0, carbs: 0.3, fat: 0, healthLabel: "Excellent" },
  { emoji: "🍕", name: "Pizza", calories: 266, protein: 11, carbs: 33, fat: 10, healthLabel: "High Cal" },
  { emoji: "🍔", name: "Burger", calories: 295, protein: 17, carbs: 24, fat: 14, healthLabel: "High Cal" },
  { emoji: "🥟", name: "Samosa", calories: 262, protein: 4, carbs: 28, fat: 15, healthLabel: "High Cal" },
  { emoji: "🍲", name: "Upma", calories: 155, protein: 4, carbs: 22, fat: 6, healthLabel: "Good" },
];

export const alternatives: Record<string, { suggestion: string; reason: string }> = {
  "Rice": { suggestion: "Quinoa", reason: "+2g protein, more fiber, lower GI" },
  "Bread": { suggestion: "Roti", reason: "-194 cal, whole grain, less processed" },
  "Biryani": { suggestion: "Dal + Rice", reason: "-116 cal, higher protein density" },
  "Pizza": { suggestion: "Roti + Paneer", reason: "-1 cal but +10g protein" },
  "Burger": { suggestion: "Chicken Wrap", reason: "-80 cal, +5g protein" },
  "Samosa": { suggestion: "Idli (3 pcs)", reason: "-88 cal, lower fat, steamed" },
  "Butter": { suggestion: "Greek Yogurt", reason: "-658 cal, +9g protein" },
  "Peanuts": { suggestion: "Almonds", reason: "Better omega profile, more fiber" },
  "Milk": { suggestion: "Greek Yogurt", reason: "+7g protein per serving" },
};
