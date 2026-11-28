/** Règles de lecture du catalogue MVP (US-CAT-01 à 04). Aucun prix ou produit n'est fourni ici. */
export type EtatPublicationProduit = 'brouillon' | 'a_valider' | 'publie' | 'masque';
export type EtatFournisseur = 'a_valider' | 'valide' | 'refuse' | 'suspendu';

export interface CategorieCatalogue {
  id: string;
  nom: string;
  active: boolean;
}
export interface FournisseurCatalogue {
  id: string;
  nom: string;
  pays: string;
  etat: EtatFournisseur;
}
export interface ProduitCatalogue {
  id: string;
  nom: string;
  description: string;
  categorieId: string;
  fournisseurId: string;
  images: readonly string[];
  variantes: readonly string[];
  /** FCFA XOF entier; null tant qu'aucun prix indicatif vérifié n'est défini. */
  prixIndicatifXof: number | null;
  origine: string;
  delaiEstimeJours: number | null;
  misEnAvant: boolean;
  promotion: boolean;
  etat: EtatPublicationProduit;
}
export interface FiltresCatalogue {
  recherche?: string;
  categorieId?: string;
  prixMinXof?: number;
  prixMaxXof?: number;
}

/** Le client ne voit que les produits publiés dont le fournisseur est validé et la catégorie active. */
export function produitVisibleClient(
  produit: ProduitCatalogue,
  fournisseur: FournisseurCatalogue | undefined,
  categorie: CategorieCatalogue | undefined,
): boolean {
  return produit.etat === 'publie'
    && fournisseur?.etat === 'valide'
    && categorie?.active === true
    && produit.categorieId === categorie.id
    && produit.fournisseurId === fournisseur.id;
}

/** Une catégorie vide (après application des règles de visibilité) est retirée de l'accueil. */
export function categoriesAvecProduits(
  categories: readonly CategorieCatalogue[],
  produits: readonly ProduitCatalogue[],
  fournisseurs: readonly FournisseurCatalogue[],
): CategorieCatalogue[] {
  const fournisseursParId = new Map(fournisseurs.map((f) => [f.id, f]));
  return categories.filter((categorie) =>
    categorie.active && produits.some((produit) =>
      produit.categorieId === categorie.id
      && produitVisibleClient(produit, fournisseursParId.get(produit.fournisseurId), categorie),
    ),
  );
}

export function rechercherCatalogue(
  produits: readonly ProduitCatalogue[],
  fournisseurs: readonly FournisseurCatalogue[],
  categories: readonly CategorieCatalogue[],
  filtres: FiltresCatalogue = {},
): ProduitCatalogue[] {
  const fournisseursParId = new Map(fournisseurs.map((f) => [f.id, f]));
  const categoriesParId = new Map(categories.map((c) => [c.id, c]));
  const recherche = normaliser(filtres.recherche ?? '');
  if (filtres.prixMinXof !== undefined && (!Number.isSafeInteger(filtres.prixMinXof) || filtres.prixMinXof < 0)) {
    throw new RangeError('Le prix minimum doit être un entier XOF positif.');
  }
  if (filtres.prixMaxXof !== undefined && (!Number.isSafeInteger(filtres.prixMaxXof) || filtres.prixMaxXof < 0)) {
    throw new RangeError('Le prix maximum doit être un entier XOF positif.');
  }
  if (filtres.prixMinXof !== undefined && filtres.prixMaxXof !== undefined && filtres.prixMinXof > filtres.prixMaxXof) {
    throw new RangeError('Le prix minimum ne peut pas dépasser le prix maximum.');
  }
  return produits.filter((produit) => {
    if (!produitVisibleClient(produit, fournisseursParId.get(produit.fournisseurId), categoriesParId.get(produit.categorieId))) return false;
    if (filtres.categorieId && produit.categorieId !== filtres.categorieId) return false;
    if (recherche && !normaliser(`${produit.nom} ${produit.description}`).includes(recherche)) return false;
    if ((filtres.prixMinXof !== undefined || filtres.prixMaxXof !== undefined) && produit.prixIndicatifXof === null) return false;
    if (filtres.prixMinXof !== undefined && (produit.prixIndicatifXof as number) < filtres.prixMinXof) return false;
    if (filtres.prixMaxXof !== undefined && (produit.prixIndicatifXof as number) > filtres.prixMaxXof) return false;
    return true;
  });
}

/** Vérifie un lien produit avant de proposer une commande directe; aucun appel réseau n'est fait. */
export function validerLienProduit(valeur: string): URL {
  let url: URL;
  try { url = new URL(valeur); } catch { throw new TypeError('Saisissez un lien produit valide.'); }
  const hote = url.hostname.toLowerCase().replace(/^www\./, '');
  const autorises = ['alibaba.com', '1688.com', 'trendyol.com'];
  if (url.protocol !== 'https:' || !autorises.some((domaine) => hote === domaine || hote.endsWith(`.${domaine}`))) {
    throw new TypeError('Le lien doit provenir d’Alibaba, 1688 ou Trendyol et utiliser HTTPS.');
  }
  return url;
}

/** Les favoris sont de simples IDs; la persistance synchronisée relève des apps et de l'API. */
export function basculerFavori(favoris: readonly string[], produitId: string): string[] {
  if (!produitId.trim()) throw new TypeError('Identifiant de produit requis.');
  return favoris.includes(produitId) ? favoris.filter((id) => id !== produitId) : [...favoris, produitId];
}

export const MENTION_PRIX_INDICATIF = 'Prix indicatif, confirmé par devis';

function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim();
}
