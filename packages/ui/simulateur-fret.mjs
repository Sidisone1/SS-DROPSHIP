// SS DROPSHIP — simulateur de fret et contrôle des articles interdits.
// Version 2026-11-23. Tarifs d'EXEMPLE : le barème réel reste à arbitrer (M-003).
// Le maritime est prévu en phase 2 (ROADMAP) : il est calculé mais marqué « phase2 ».

export const PAYS = {
  CI: "Côte d'Ivoire",
  GH: "Ghana",
  GN: "Guinée",
};

// Tarifs d'exemple en FCFA : par kg pour l'aérien, par m³ pour le maritime.
export const TARIFS = {
  express: { unite: "kg", delai: "4 à 7 jours", CI: 13500, GH: 14000, GN: 14500 },
  aerien: { unite: "kg", delai: "10 à 15 jours", CI: 9800, GH: 10200, GN: 10500 },
  maritime: { unite: "m3", delai: "45 à 60 jours", phase2: true, CI: 265000, GH: 275000, GN: 285000 },
};

export const DIVISEUR_VOLUMETRIQUE = 6000; // cm³ par kg (aérien)
export const VOLUME_MINIMUM_M3 = 0.1; // facturation maritime minimale
export const TAUX_ASSURANCE = 0.02; // 2 % de la valeur déclarée (exemple)

// Catégories refusées par mode. Téléphones et ordinateurs portables restent acceptés en express.
export const INTERDITS = {
  tous: ["armes", "materiel_militaire", "explosifs", "stupefiants", "denrees_perissables"],
  express: ["inflammables", "produits_chimiques", "batteries_seules", "liquides"],
  aerien: ["inflammables", "produits_chimiques", "batteries_seules"],
  maritime: [],
};

export function verifierArticle(mode, categorie) {
  if (!TARIFS[mode]) throw new Error(`Mode inconnu : ${mode}`);
  const refuse = INTERDITS.tous.includes(categorie) || INTERDITS[mode].includes(categorie);
  return { autorise: !refuse, raison: refuse ? `${categorie} interdit en ${mode}` : null };
}

const arrondi = (n, pas = 0.5) => Math.ceil(n / pas) * pas;

export function simulerFret({ mode, pays, poidsKg = 0, longueurCm = 0, largeurCm = 0, hauteurCm = 0, valeurDeclaree = 0, assurance = false }) {
  const t = TARIFS[mode];
  if (!t) throw new Error(`Mode inconnu : ${mode}`);
  if (!PAYS[pays]) throw new Error(`Pays non couvert : ${pays}`);
  if ([poidsKg, longueurCm, largeurCm, hauteurCm, valeurDeclaree].some((v) => !(v >= 0))) {
    throw new Error("Les valeurs doivent être positives");
  }
  const volumeCm3 = longueurCm * largeurCm * hauteurCm;
  let quantite;
  if (t.unite === "kg") {
    const volumetrique = volumeCm3 / DIVISEUR_VOLUMETRIQUE;
    quantite = arrondi(Math.max(poidsKg, volumetrique));
  } else {
    quantite = Math.max(volumeCm3 / 1e6, VOLUME_MINIMUM_M3);
    quantite = Math.round(quantite * 1000) / 1000;
  }
  const fret = Math.round(quantite * t[pays]);
  const prime = assurance ? Math.round(valeurDeclaree * TAUX_ASSURANCE) : 0;
  return {
    mode,
    pays,
    unite: t.unite,
    quantiteFacturee: quantite,
    tarifUnitaire: t[pays],
    fret,
    assurance: prime,
    total: fret + prime,
    delai: t.delai,
    phase2: Boolean(t.phase2),
    exemple: true,
  };
}
