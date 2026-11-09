import { supabase } from "../supabase";
import { cleanDetails, computeFields } from "./games";

/** Fonction d'enregistement d'un match
 * @param {*} date Date du match
 * @param {*} gameId Id du jeu
 * @param {*} pin Pin de sécurité
 * @param {*} preview Données de varation calculées
 * @param {*} playerDetails Données saisies pour les joueurs
 * @param {*} playerFields Liste des données possibles pour les joueurs
 * @param {*} matchFields Données saisies pour le match
 * @param {*} matchDetails Liste des données possibles pour le match
 */
export async function saveMatch(pin, gameId, date, preview, playerDetails, playerFields, matchDetails, matchFields) {
    const { error } = await supabase.rpc('add_match', {
        p_pin: pin,
        p_game_id: gameId,
        p_played_at: date,
        p_results: preview.map((player) => ({
            player_id: player.id, 
            rang: player.rang, 
            elo_before: player.before, 
            elo_after: player.after,
            details: cleanDetails(computeFields(playerDetails[player.id], playerFields), playerFields),
        })),
        p_details: cleanDetails(matchDetails, matchFields),
        });
    if (error) throw error;
}