/** Règles du catalogue MVP (US-CAT-01 à 04). Aucun produit ni prix n'est fourni ici. */
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
  /** Montant entier XOF ; null tant qu'aucun prix indicatif vérifié n'est défini. */
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

/** Le client voit seulement les produits publiés de catégories et fournisseurs validés. */
export function produitVisibleClient(
  produit: ProduitCatalogue,
  fournisseur: FournisseurCatalogue | undefined,
  categorie: CategorieCatalogue | undefined,
): boolean {
  return (
    produit.etat === 'publie' &&
    fournisseur?.etat === 'valide' &&
    categorie?.active === true &&
    produit.categorieId === categorie.id &&
    produit.fournisseurId === fournisseur.id
  );
}

/** Les catégories sans produit visible sont retirées de l'accueil. */
export function categoriesAvecProduits(
  categories: readonly CategorieCatalogue[],
  produits: readonly ProduitCatalogue[],
  fournisseurs: readonly FournisseurCatalogue[],
): CategorieCatalogue[] {
  const fournisseursParId = new Map(fournisseurs.map((fournisseur) => [fournisseur.id, fournisseur]));
  return categories.filter(
    (categorie) =>
      categorie.active &&
      produits.some(
        (produit) =>
          produit.categorieId === categorie.id &&
          produitVisibleClient(produit, fournisseursParId.get(produit.fournisseurId), categorie),
      ),
  );
}

export function rechercherCatalogue(
  produits: readonly ProduitCatalogue[],
  fournisseurs: readonly FournisseurCatalogue[],
  categories: readonly CategorieCatalogue[],
  filtres: FiltresCatalogue = {},
): ProduitCatalogue[] {
  const fournisseursParId = new Map(fournisseurs.map((fournisseur) => [fournisseur.id, fournisseur]));
  const categoriesParId = new Map(categories.map((categorie) => [categorie.id, categorie]));
  const recherche = normaliser(filtres.recherche ?? '');

  for (const prix of [filtres.prixMinXof, filtres.prixMaxXof]) {
    if (prix !== undefined && (!Number.isSafeInteger(prix) || prix < 0)) {
      throw new RangeError('Le prix doit être un entier XOF positif.');
    }
  }
  if (
    filtres.prixMinXof !== undefined &&
    filtres.prixMaxXof !== undefined &&
    filtres.prixMinXof > filtres.prixMaxXof
  ) {
    throw new RangeError('Le prix minimum ne peut pas dépasser le prix maximum.');
  }

  return produits.filter((produit) => {
    if (
      !produitVisibleClient(
        produit,
        fournisseursParId.get(produit.fournisseurId),
        categoriesParId.get(produit.categorieId),
      )
    ) {
      return false;
    }
    if (filtres.categorieId && produit.categorieId !== filtres.categorieId) return false;
    if (recherche && !normaliser(`${produit.nom} ${produit.description}`).includes(recherche)) return false;

    const prix = produit.prixIndicatifXof;
    if ((filtres.prixMinXof !== undefined || filtres.prixMaxXof !== undefined) && prix === null) {
      return false;
    }
    if (prix !== null && filtres.prixMinXof !== undefined && prix < filtres.prixMinXof) return false;
    if (prix !== null && filtres.prixMaxXof !== undefined && prix > filtres.prixMaxXof) return false;
    return true;
  });
}

/** Valide un lien avant une commande directe ; aucun appel réseau n'est effectué. */
export function validerLienProduit(valeur: string): URL {
  let url: URL;
  try {
    url = new URL(valeur);
  } catch {
    throw new TypeError('Saisissez un lien produit valide.');
  }

  const hote = url.hostname.toLowerCase().replace(/^www\./, '');
  const domainesAutorises = ['alibaba.com', '1688.com', 'trendyol.com'];
  const domaineAutorise = domainesAutorises.some(
    (domaine) => hote === domaine || hote.endsWith(`.${domaine}`),
  );
  if (url.protocol !== 'https:' || !domaineAutorise) {
    throw new TypeError('Le lien doit provenir d’Alibaba, 1688 ou Trendyol et utiliser HTTPS.');
  }
  return url;
}

/** Bascule un ID favori localement ; la synchronisation relève des apps et de l'API. */
export function basculerFavori(favoris: readonly string[], produitId: string): string[] {
  if (!produitId.trim()) throw new TypeError('Identifiant de produit requis.');
  return favoris.includes(produitId)
    ? favoris.filter((id) => id !== produitId)
    : [...favoris, produitId];
}

export const MENTION_PRIX_INDICATIF = 'Prix indicatif, confirmé par devis';

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .trim();
}
