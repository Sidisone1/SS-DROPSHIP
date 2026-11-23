// Design tokens SS DROPSHIP (US-SOC-06, design/branding/DESIGN_SYSTEM.md, D-003, D-018).
// Palette de marque stricte : bleu, rouge, blanc, bleu nuit. Aucun jaune, doré ou orange tirant vers le jaune.

export const couleurs = {
  bleu: '#0077C8',
  rouge: '#F21A16',
  blanc: '#FFFFFF',
  nuit: '#10213D', // valeur provisoire, à harmoniser avec le logo original
  // Neutres (jamais couleur de marque principale)
  surface: '#F4F6F8',
  bordure: '#D9DEE5',
  texteSecondaire: '#4A5568',
  // Réservé au motif bogolan et aux cartons (D-018)
  brunBogolan: '#6B3E26',
} as const;
export type NomCouleur = keyof typeof couleurs;

/** Rôles sémantiques : pas de vert ni d'orange ajoutés à la palette. */
export const roles = {
  fond: couleurs.blanc,
  fondSecondaire: couleurs.surface,
  texte: couleurs.nuit,
  texteSecondaire: couleurs.texteSecondaire,
  action: couleurs.bleu,
  texteSurAction: couleurs.blanc,
  accent: couleurs.rouge,
  erreur: couleurs.rouge,
  succes: couleurs.bleu,
  bordure: couleurs.bordure,
  enTete: couleurs.nuit,
  texteSurEnTete: couleurs.blanc,
} as const;

export const espacements = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;
export const rayons = { s: 8, m: 12, l: 16, pilule: 999 } as const;
export const typographie = {
  famille: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  tailles: { petit: 13, normal: 15, moyen: 17, grand: 20, titre: 26 },
  graisses: { normal: 400, moyen: 500, gras: 700 },
} as const;
export const ombres = {
  carte: '0 4px 16px rgba(16, 33, 61, 0.08)',
  flottant: '0 8px 24px rgba(16, 33, 61, 0.16)',
} as const;

// ─── Contrastes (WCAG 2.2) ───────────────────────────────────────────────────

function canal(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

export function contraste(a: string, b: string): number {
  const [claire, foncee] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (claire + 0.05) / (foncee + 0.05);
}

/** Teinte HSL en degrés et saturation (0–1), pour détecter les jaunes. */
export function teinte(hex: string): { h: number; s: number } {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return { h: 0, s: 0 };
  const l = (max + min) / 2;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s };
}

/** Jaune, doré ou orange tirant vers le jaune : teinte entre 35° et 75° avec une saturation visible. */
export const estJaunatre = (hex: string): boolean => {
  const { h, s } = teinte(hex);
  return s > 0.25 && h >= 35 && h <= 75;
};

/**
 * Associations texte / fond autorisées. `minimum` = 4,5 pour le texte courant, 3 pour le grand texte
 * (≥ 24 px, ou ≥ 18,66 px en gras), les icônes et les bordures de composants.
 */
export const associations = [
  { texte: roles.texte, fond: roles.fond, minimum: 4.5, usage: 'texte courant' },
  { texte: roles.texte, fond: roles.fondSecondaire, minimum: 4.5, usage: 'texte sur surface' },
  { texte: roles.texteSecondaire, fond: roles.fond, minimum: 4.5, usage: 'texte secondaire' },
  { texte: roles.texteSurAction, fond: roles.action, minimum: 4.5, usage: 'bouton principal' },
  { texte: roles.action, fond: roles.fond, minimum: 4.5, usage: 'lien' },
  { texte: roles.texteSurEnTete, fond: roles.enTete, minimum: 4.5, usage: 'en-tête' },
  {
    texte: couleurs.blanc,
    fond: couleurs.rouge,
    minimum: 3,
    usage: 'badge ou bouton rouge : grand texte gras uniquement',
  },
  { texte: couleurs.rouge, fond: couleurs.blanc, minimum: 3, usage: 'message d erreur : gras ≥ 18,66 px ou icône' },
] as const;

/** Variables CSS à injecter dans les apps web : `:root { --ss-bleu: … }`. */
export function variablesCss(): string {
  const lignes = [
    ...Object.entries(couleurs).map(([nom, valeur]) => `  --ss-${nom}: ${valeur};`),
    ...Object.entries(roles).map(([nom, valeur]) => `  --ss-role-${nom}: ${valeur};`),
    ...Object.entries(espacements).map(([nom, valeur]) => `  --ss-espace-${nom}: ${valeur}px;`),
    ...Object.entries(rayons).map(([nom, valeur]) => `  --ss-rayon-${nom}: ${valeur}px;`),
    `  --ss-police: ${typographie.famille};`,
    `  --ss-ombre-carte: ${ombres.carte};`,
    `  --ss-ombre-flottant: ${ombres.flottant};`,
  ];
  return `:root {\n${lignes.join('\n')}\n}\n`;
}
