create or replace function check_is_user_deleted(identifier text)
returns boolean
language plpgsql
security definer
as $$
declare
  target_user_id uuid;
  is_deleted boolean;
begin
  select user_id into target_user_id
  from profiles
  where email = lower(identifier) 
     or phone = identifier
  limit 1;

  if target_user_id is null then
    return false;
  end if;

  select exists(
    select 1 
    from deleted_users 
    where user_id = target_user_id
  ) into is_deleted;

  return is_deleted;
end;
$$;
