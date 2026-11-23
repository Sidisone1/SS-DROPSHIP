/** Icône 3D Bogolan (design/icons/bogolan/png, D-018), copiée dans public/icones au build. */
export function Icone({ nom, libelle, taille = 48 }: { nom: string; libelle: string; taille?: number }) {
  // biome-ignore lint/performance/noImgElement: icônes statiques déjà optimisées en 256 × 256.
  return <img src={`/icones/${nom}.png`} alt={libelle} width={taille} height={taille} loading="lazy" />;
}
