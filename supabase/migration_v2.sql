-- Migration : image des jeux + suppression de la dernière partie
-- À exécuter UNE fois dans Supabase > SQL Editor sur une base déjà créée avec l'ancien schema.sql

alter table games add column if not exists image text;
drop function if exists add_game(text, text, numeric, jsonb);

-- Ajout d'un jeu (image facultative : nom de fichier dans public/games/)
create or replace function add_game(p_pin text, p_name text, p_default_k numeric, p_k jsonb, p_image text default null)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v uuid; e jsonb;
begin
  if not check_pin(p_pin) then raise exception 'Code PIN incorrect'; end if;
  insert into games (name, default_k, image) values (trim(p_name), p_default_k, nullif(trim(p_image), '')) returning id into v;
  for e in select * from jsonb_array_elements(coalesce(p_k, '[]'::jsonb)) loop
    insert into game_k_factors values (v, (e->>'nb_players')::int, (e->>'k_factor')::numeric);
  end loop;
  return v;
end $$;

-- Annule la dernière partie SAISIE d'un jeu : restaure l'Elo d'avant et supprime la partie
create or replace function delete_last_match(p_pin text, p_match_id uuid)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_game uuid; v_last uuid; r record;
begin
  if not check_pin(p_pin) then raise exception 'Code PIN incorrect'; end if;
  select game_id into v_game from matches where id = p_match_id;
  if v_game is null then raise exception 'Partie introuvable'; end if;
  select id into v_last from matches where game_id = v_game order by created_at desc, id desc limit 1;
  if v_last <> p_match_id then raise exception 'Seule la dernière partie saisie de ce jeu peut être annulée'; end if;
  for r in select player_id, elo_before from match_players where match_id = p_match_id loop
    update ratings set elo = r.elo_before, games_played = games_played - 1
    where game_id = v_game and player_id = r.player_id;
  end loop;
  delete from ratings where game_id = v_game and games_played <= 0;
  delete from matches where id = p_match_id; -- match_players supprimés en cascade
end $$;

grant execute on function add_game(text, text, numeric, jsonb, text) to anon, authenticated;
grant execute on function delete_last_match(text, uuid) to anon, authenticated;
