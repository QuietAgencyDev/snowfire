-- Customers can write their own request-received notifications.
create policy notifications_insert_own on public.notifications
  for insert with check (user_id = public.current_profile_id());
