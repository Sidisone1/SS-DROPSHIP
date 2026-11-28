import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  basculerFavori,
  categoriesAvecProduits,
  MENTION_PRIX_INDICATIF,
  produitVisibleClient,
  rechercherCatalogue,
  validerLienProduit,
  type CategorieCatalogue,
  type FournisseurCatalogue,
  type ProduitCatalogue,
} from './catalogue.ts';

const categories: CategorieCatalogue[] = [
  { id: 'cat-1', nom: 'Téléphones', active: true },
  { id: 'cat-2', nom: 'Informatique', active: true },
  { id: 'cat-3', nom: 'Masquée', active: false },
];
const fournisseurs: FournisseurCatalogue[] = [
  { id: 'f-1', nom: 'Fournisseur validé', pays: 'CN', etat: 'valide' },
  { id: 'f-2', nom: 'En attente', pays: 'TR', etat: 'a_valider' },
];
const produits: ProduitCatalogue[] = [
  {
    id: 'p-1',
    nom: 'Téléphone Étoile',
    description: 'Android 128 Go',
    categorieId: 'cat-1',
    fournisseurId: 'f-1',
    images: [],
    variantes: ['Noir'],
    prixIndicatifXof: 85000,
    origine: 'CN',
    delaiEstimeJours: 25,
    misEnAvant: true,
    promotion: false,
    etat: 'publie',
  },
  {
    id: 'p-2',
    nom: 'Ordinateur',
    description: 'Portable',
    categorieId: 'cat-2',
    fournisseurId: 'f-1',
    images: [],
    variantes: [],
    prixIndicatifXof: null,
    origine: 'CN',
    delaiEstimeJours: null,
    misEnAvant: false,
    promotion: false,
    etat: 'publie',
  },
  {
    id: 'p-3',
    nom: 'Produit non validé',
    description: '',
    categorieId: 'cat-1',
    fournisseurId: 'f-2',
    images: [],
    variantes: [],
    prixIndicatifXof: 1000,
    origine: 'TR',
    delaiEstimeJours: 10,
    misEnAvant: true,
    promotion: true,
    etat: 'publie',
  },
  {
    id: 'p-4',
    nom: 'Brouillon',
    description: '',
    categorieId: 'cat-1',
    fournisseurId: 'f-1',
    images: [],
    variantes: [],
    prixIndicatifXof: 1000,
    origine: 'CN',
    delaiEstimeJours: 10,
    misEnAvant: false,
    promotion: false,
    etat: 'brouillon',
  },
];

function produit(id: string): ProduitCatalogue {
  const trouve = produits.find((element) => element.id === id);
  if (!trouve) throw new Error(`Produit de test absent : ${id}`);
  return trouve;
}

function fournisseur(id: string): FournisseurCatalogue {
  const trouve = fournisseurs.find((element) => element.id === id);
  if (!trouve) throw new Error(`Fournisseur de test absent : ${id}`);
  return trouve;
}

function categorie(id: string): CategorieCatalogue {
  const trouve = categories.find((element) => element.id === id);
  if (!trouve) throw new Error(`Catégorie de test absente : ${id}`);
  return trouve;
}

test('cache les produits non publiés et les fournisseurs non validés', () => {
  assert.equal(produitVisibleClient(produit('p-1'), fournisseur('f-1'), categorie('cat-1')), true);
  assert.equal(produitVisibleClient(produit('p-3'), fournisseur('f-2'), categorie('cat-1')), false);
  assert.deepEqual(
    rechercherCatalogue(produits, fournisseurs, categories).map((element) => element.id),
    ['p-1', 'p-2'],
  );
});

test('retire les catégories vides et inactives de l’accueil', () => {
  assert.deepEqual(
    categoriesAvecProduits(categories, produits, fournisseurs).map((element) => element.id),
    ['cat-1', 'cat-2'],
  );
});

test('recherche sans accents et filtre par catégorie et prix', () => {
  assert.deepEqual(
    rechercherCatalogue(produits, fournisseurs, categories, {
      recherche: 'etoile',
      categorieId: 'cat-1',
      prixMinXof: 80000,
      prixMaxXof: 90000,
    }).map((element) => element.id),
    ['p-1'],
  );
});

test('exclut du filtre prix les produits sans prix indicatif', () => {
  assert.deepEqual(
    rechercherCatalogue(produits, fournisseurs, categories, { prixMinXof: 0 }).map((element) => element.id),
    ['p-1'],
  );
});

test('rejette les prix incohérents', () => {
  assert.throws(() => rechercherCatalogue(produits, fournisseurs, categories, { prixMinXof: 10.5 }), RangeError);
  assert.throws(
    () => rechercherCatalogue(produits, fournisseurs, categories, { prixMinXof: 2, prixMaxXof: 1 }),
    RangeError,
  );
});

test('autorise les domaines prévus en HTTPS et refuse les autres', () => {
  assert.equal(validerLienProduit('https://www.alibaba.com/item/123').hostname, 'www.alibaba.com');
  assert.equal(validerLienProduit('https://detail.1688.com/offer/123').hostname, 'detail.1688.com');
  assert.throws(() => validerLienProduit('http://alibaba.com/item/1'), TypeError);
  assert.throws(() => validerLienProduit('https://alibaba.com.evil.example/item/1'), TypeError);
});

test('ajoute et retire un favori sans muter la liste source', () => {
  const source = ['p-1'];
  assert.deepEqual(basculerFavori(source, 'p-2'), ['p-1', 'p-2']);
  assert.deepEqual(basculerFavori(source, 'p-1'), []);
  assert.deepEqual(source, ['p-1']);
  assert.throws(() => basculerFavori([], ''), TypeError);
});

test('le libellé avertit que le prix reste indicatif et soumis à devis', () => {
  assert.match(MENTION_PRIX_INDICATIF, /indicatif.*devis/i);
});
