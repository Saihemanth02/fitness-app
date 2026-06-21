
-- Add UPDATE/DELETE policies for badges
CREATE POLICY "Users can update own badges" ON public.badges FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own badges" ON public.badges FOR DELETE USING (auth.uid() = user_id);

-- Add UPDATE/DELETE policies for streaks
CREATE POLICY "Users can update own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own streaks" ON public.streaks FOR DELETE USING (auth.uid() = user_id);

-- Revoke EXECUTE on trigger functions from anon/authenticated (only the trigger system needs them)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_extras() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_goals() FROM PUBLIC, anon, authenticated;

-- Revoke from anon on user-facing RPCs (only authenticated users should call them)
REVOKE EXECUTE ON FUNCTION public.unlock_badge(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_streak() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unlock_badge(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_streak() TO authenticated;
