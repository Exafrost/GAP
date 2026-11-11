import { useState } from "react";

export default function PageHeader({ title, lead, displayHelpELOLink = false }) {
    const [displayHelpELO, setdisplayHelpELO] = useState(null);
  
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {displayHelpELOLink && <a className="textbtn" onClick={() => setdisplayHelpELO(true)}>Comment fonctionne l'ELO ?</a>}
      {displayHelpELO && <div className="overlay" onClick={() => setdisplayHelpELO(null)}>
        <div className="panel pad big-modal">
          <h2>Comment fonctionne l'ELO ?</h2>
          L'ELO est un score attribué à chaque personne pour estimer son niveau dans une activité compétitive. L'exemple le plus connu est celui des échecs mais la variante appelée souvent MMR est très répandue dans le monde des jeux vidéos.
          <h3>Chaque jeu possède son propre classement</h3>
          Comme le fonctionnement des jeux peut grandement différer d'un jeu à l'autre, chacun possède son propre classement pour éviter de comparer des éléments non-comparables.
          <h3>Comment est calculé la variation d'ELO ?</h3>
          Chaque match d'un jeu compare des joueurs à d'autres, l'elo fonctionne de la même manière. Il va comparer un joueur contre un autre joueur et estimer la difficulté du match pour chacun. 
          Si deux joueurs possèdent un ELO similaire, alors le match est équilibré ; cependant si la différence est grande, alors il est désiquilibré : si le joueur "faible" perd, il s'agissait du résultat attendu et il ne perdra pas énormément de points,
          à l'inverse, s'il gagne la partie, alors il a renversé la situation et remportera énormément de points d'ELO.
          <h3>Et la formule de calcul de l'ELO, elle ressemble à quoi concrètement ?</h3>
          La formule est proche de celle de l'ELO, mais rapportée à plusieurs joueurs. Pour chaque couple de joueur, la formule est E_n+1 = E_n + K * (W - p(D)) avec E_n+1 et E_n les scores ELO après et avant changement, 
          K le facteur d'atténuation calibré selon le nombre de joueurs et le jeu, W un valeur entre 0 et 1 pour si le joueur a perdu ou gagné et p(D) la probabilité de gagner contre l'adversaire (proche de 1 si garantie, 0 si improbable).
          Pour davantage de détails, je vous renvoie vers <a target="_blank" href="https://fr.wikipedia.org/wiki/Classement_Elo#Joueurs_ayant_d%C3%A9j%C3%A0_un_classement">la page wikipedia pour l'ELO des échecs</a>.
        </div>
      </div>}
    </header>
  );
}
