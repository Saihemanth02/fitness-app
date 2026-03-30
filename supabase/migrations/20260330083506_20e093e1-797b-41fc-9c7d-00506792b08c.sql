
-- Drop overly permissive ALL policies on badges and streaks
DROP POLICY IF EXISTS "Users manage own badges" ON public.badges;
DROP POLICY IF EXISTS "Users manage own streaks" ON public.streaks;

-- Badges: allow SELECT and INSERT only (no direct UPDATE/DELETE)
CREATE POLICY "Users can view own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks: allow SELECT and INSERT only (no direct UPDATE/DELETE)
CREATE POLICY "Users can view own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Server-side function to unlock a badge (validates it can only set false->true)
CREATE OR REPLACE FUNCTION public.unlock_badge(_badge_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _badge_key NOT IN ('first_workout', 'streak7', 'streak10', 'steps10k', 'first_food', 'plan_generated') THEN
    RAISE EXCEPTION 'Invalid badge key';
  END IF;

  EXECUTE format(
    'UPDATE public.badges SET %I = true WHERE user_id = $1 AND %I = false',
    _badge_key, _badge_key
  ) USING _user_id;

  RETURN true;
END;
$$;

-- Server-side function to increment streak with date validation
CREATE OR REPLACE FUNCTION public.increment_streak()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _current_count int;
  _last_date date;
  _today date := CURRENT_DATE;
  _yesterday date := CURRENT_DATE - 1;
  _new_count int;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT count, last_workout_date INTO _current_count, _last_date
  FROM public.streaks WHERE user_id = _user_id;

  -- Already worked out today
  IF _last_date = _today THEN
    RETURN jsonb_build_object('count', _current_count, 'lastWorkoutDate', _today::text);
  END IF;

  -- Continue streak if last workout was yesterday, otherwise reset to 1
  IF _last_date = _yesterday OR COALESCE(_current_count, 0) = 0 THEN
    _new_count := COALESCE(_current_count, 0) + 1;
  ELSE
    _new_count := 1;
  END IF;

  UPDATE public.streaks SET count = _new_count, last_workout_date = _today WHERE user_id = _user_id;

  RETURN jsonb_build_object('count', _new_count, 'lastWorkoutDate', _today::text);
END;
$$;
