

## Add User Authentication with Google & Email/Password

### Overview
Add full authentication (Google OAuth + email/password signup/signin) with database-backed user profiles. Unauthenticated users see a login page; authenticated users access the app with their data persisted in the database.

### Database Changes

**1. Create `profiles` table**
- Columns: `id` (uuid, FK to auth.users), `name`, `age`, `height`, `weight`, `goal`, `activity_level`, `created_at`, `updated_at`
- RLS: users can read/update only their own profile
- Trigger: auto-create profile row on signup

**2. Create `food_logs` table**
- Columns: `id`, `user_id` (FK), `name`, `emoji`, `calories`, `protein`, `carbs`, `fat`, `label`, `logged_at`
- RLS: users CRUD only their own rows

**3. Create `workouts` table**
- Columns: `id`, `user_id`, `type`, `duration`, `calories_burned`, `completed_at`
- RLS: users CRUD own rows

**4. Create `weight_history` table**
- Columns: `id`, `user_id`, `weight`, `date`
- RLS: users CRUD own rows

**5. Create `water_logs`, `streaks`, `badges` tables**
- Similar pattern — one row per user per day (water/streaks) or per user (badges)

### Auth Configuration
- Enable Google OAuth via Lovable Cloud managed credentials (no user setup needed)
- Keep email confirmation enabled by default

### New Files

**`src/pages/AuthPage.tsx`**
- Login/signup form with email+password tabs
- Google sign-in button using `lovable.auth.signInWithOAuth("google")`
- Password reset link → forgot password flow

**`src/pages/ResetPasswordPage.tsx`**
- Handles `/reset-password` route for password recovery

**`src/hooks/useAuth.tsx`**
- Auth context providing `user`, `session`, `signOut`, `loading` state
- Uses `onAuthStateChange` listener (set up before `getSession()`)

### Modified Files

**`src/App.tsx`**
- Wrap app in `AuthProvider`
- Add `/reset-password` route
- Protect the main `Index` route — redirect to `AuthPage` if not logged in

**`src/lib/store.ts`**
- Replace localStorage calls with Supabase queries (or keep localStorage as cache with DB sync)
- Each method takes `userId` and reads/writes from database tables

**`src/pages/ProfilePage.tsx`**
- Add logout button
- Show user email
- Save profile to database instead of localStorage

**`src/pages/Index.tsx`**
- Show user name from auth session in sidebar/header

**All data pages** (Dashboard, Workout, Nutrition, Analytics, Plan)
- Update to use authenticated user's database data instead of localStorage

### Flow
1. User opens app → sees AuthPage (login/signup + Google)
2. Signs up → email confirmation sent → confirms → logged in
3. Profile auto-created via trigger with defaults
4. All data (food logs, workouts, weight, etc.) stored per-user in database
5. Logout button on Profile page clears session

