export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
}

export interface WorkoutType {
  id: string;
  emoji: string;
  name: string;
  duration: string;
  kcal: number;
  difficulty: string;
  difficultyColor: string;
  exercises: Exercise[];
}

export const workouts: WorkoutType[] = [
  {
    id: "hiit", emoji: "🔥", name: "HIIT Blast", duration: "7 min", kcal: 120,
    difficulty: "Hard", difficultyColor: "coral",
    exercises: [
      { name: "Jumping Jacks", duration: "60s" },
      { name: "Burpees", sets: 3, reps: 8 },
      { name: "High Knees", duration: "60s" },
      { name: "Mountain Climbers", duration: "60s" },
      { name: "Squat Jumps", sets: 3, reps: 10 },
    ]
  },
  {
    id: "core", emoji: "💪", name: "Core Crusher", duration: "7 min", kcal: 95,
    difficulty: "Medium", difficultyColor: "gold",
    exercises: [
      { name: "Plank Hold", duration: "60s" },
      { name: "Bicycle Crunches", sets: 3, reps: 15 },
      { name: "Leg Raises", sets: 3, reps: 12 },
      { name: "Russian Twists", sets: 3, reps: 20 },
      { name: "Dead Bug", duration: "60s" },
    ]
  },
  {
    id: "yoga", emoji: "🧘", name: "Yoga Flow", duration: "7 min", kcal: 55,
    difficulty: "Easy", difficultyColor: "teal",
    exercises: [
      { name: "Sun Salutation", duration: "90s" },
      { name: "Warrior Pose", duration: "60s" },
      { name: "Tree Pose", duration: "60s" },
      { name: "Downward Dog", duration: "60s" },
      { name: "Savasana", duration: "60s" },
    ]
  },
  {
    id: "power", emoji: "🏋️", name: "Power Lift", duration: "7 min", kcal: 110,
    difficulty: "Hard", difficultyColor: "coral",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 15 },
      { name: "Dumbbell Rows", sets: 3, reps: 12 },
      { name: "Shoulder Press", sets: 3, reps: 10 },
      { name: "Lunges", sets: 3, reps: 12 },
      { name: "Deadlift Hold", duration: "60s" },
    ]
  },
  {
    id: "cardio", emoji: "🏃", name: "Cardio Rush", duration: "7 min", kcal: 130,
    difficulty: "Hard", difficultyColor: "coral",
    exercises: [
      { name: "Sprint in Place", duration: "60s" },
      { name: "Box Jumps", sets: 3, reps: 10 },
      { name: "Skaters", duration: "60s" },
      { name: "Jump Rope (Air)", duration: "60s" },
      { name: "Tuck Jumps", sets: 3, reps: 8 },
    ]
  },
  {
    id: "stretch", emoji: "🤸", name: "Stretch & Recover", duration: "7 min", kcal: 35,
    difficulty: "Easy", difficultyColor: "teal",
    exercises: [
      { name: "Neck Stretches", duration: "60s" },
      { name: "Shoulder Rolls", duration: "60s" },
      { name: "Hamstring Stretch", duration: "90s" },
      { name: "Hip Flexor Stretch", duration: "90s" },
      { name: "Child's Pose", duration: "60s" },
    ]
  },
];
