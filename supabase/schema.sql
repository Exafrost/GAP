-- À exécuter dans Supabase > SQL Editor

create extension if not exists pgcrypto with schema extensions;

-- ========== TABLES ==========
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table games (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_k numeric not null default 32,   -- K utilisé si aucun coefficient pour le nombre de joueurs
  created_at timestamptz not null default now()
);

-- Coefficient K selon le jeu ET le nombre de joueurs
create table game_k_factors (
  game_id uuid not null references games(id) on delete cascade,
  nb_players int not null check (nb_players >= 2),
  k_factor numeric not null check (k_factor > 0),
  primary key (game_id, nb_players)
);




create table matches (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id),
  played_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- rang : 1 = vainqueur ; même rang = égalité
create table match_players (
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id),
  rang int not null check (rang >= 1),
  elo_before numeric not null,
  elo_after numeric not null,
  primary key (match_id, player_id)
);

-- Elo courant par joueur et par jeu
create table ratings (
  game_id uuid not null references games(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  elo numeric not null default 1000,
  games_played int not null default 0,
  primary key (game_id, player_id)
);

-- Stocke le hash du code PIN (jamais lisible depuis le site)
create table app_settings (key text primary key, value text not null);
insert into app_settings values ('pin_hash', extensions.crypt('1234', extensions.gen_salt('bf')));
-- ⚠️ Changer le PIN :
-- update app_settings set value = extensions.crypt('NOUVEAU_PIN', extensions.gen_salt('bf')) where key = 'pin_hash';

-- ========== SÉCURITÉ : lecture publique, écriture uniquement via PIN ==========
do $$
declare t text;
begin
  foreach t in array array['players','games','game_k_factors','matches','match_players','ratings'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "lecture publique" on %I for select using (true)', t);
  end loop;
  alter table app_settings enable row level security; -- aucune policy = inaccessible
end $$;

create or replace function check_pin(p_pin text) returns boolean
language sql security definer set search_path = public, extensions as $$
  select exists (select 1 from app_settings where key = 'pin_hash' and value = crypt(p_pin, value));
$$;
revoke execute on function check_pin(text) from public, anon, authenticated;

-- ========== FONCTIONS D'ÉCRITURE (vérifient le PIN) ==========
create or replace function add_match(p_pin text, p_game_id uuid, p_played_at date, p_results jsonb)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v_match uuid; r jsonb;
begin
  if not check_pin(p_pin) then raise exception 'Code PIN incorrect'; end if;
  insert into matches (game_id, played_at) values (p_game_id, p_played_at) returning id into v_match;
  for r in select * from jsonb_array_elements(p_results) loop
    insert into match_players (match_id, player_id, rang, elo_before, elo_after)
    values (v_match, (r->>'player_id')::uuid, (r->>'rang')::int, (r->>'elo_before')::numeric, (r->>'elo_after')::numeric);
    insert into ratings (game_id, player_id, elo, games_played)
    values (p_game_id, (r->>'player_id')::uuid, (r->>'elo_after')::numeric, 1)
    on conflict (game_id, player_id)
    do update set elo = excluded.elo, games_played = ratings.games_played + 1;
  end loop;
  return v_match;
end $$;

create or replace function add_player(p_pin text, p_name text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v uuid;
begin
  if not check_pin(p_pin) then raise exception 'Code PIN incorrect'; end if;
  insert into players (name) values (trim(p_name)) returning id into v;
  return v;
end $$;

create or replace function add_game(p_pin text, p_name text, p_default_k numeric, p_k jsonb)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v uuid; e jsonb;
begin
  if not check_pin(p_pin) then raise exception 'Code PIN incorrect'; end if;
  insert into games (name, default_k) values (trim(p_name), p_default_k) returning id into v;
  for e in select * from jsonb_array_elements(coalesce(p_k, '[]'::jsonb)) loop
    insert into game_k_factors values (v, (e->>'nb_players')::int, (e->>'k_factor')::numeric);
  end loop;
  return v;
end $$;

grant execute on function add_match(text, uuid, date, jsonb) to anon, authenticated;
grant execute on function add_player(text, text) to anon, authenticated;
grant execute on function add_game(text, text, numeric, jsonb) to anon, authenticated;

-- ========== EXEMPLE ==========
insert into games (name, default_k) values ('Catan', 32), ('Carcassonne', 32);
insert into game_k_factors (game_id, nb_players, k_factor)
select g.id, v.n, v.k from games g, (values (2,32),(3,28),(4,24),(5,20)) as v(n,k) where g.name = 'Catan';
