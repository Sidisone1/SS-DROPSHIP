import { Controller, Delete, Get, HttpCode, Param, Put, Query } from '@nestjs/common';
import { Public, Roles, Utilisateur, type UtilisateurConnecte } from '../auth/decorateurs.js';
import { introuvable, invalide } from '../commun/erreurs.js';
import { PrismaService } from '../prisma/prisma.service.js';

const MENTION_PRIX = 'Prix indicatif, confirmé par devis';

function exposerProduit(p: {
  id: string;
  titre: string;
  description: string | null;
  medias: string[];
  prixIndicatif: bigint | null;
  devise: string | null;
  variantes: unknown;
  misEnAvant: boolean;
  categorie: { id: string; slug: string; cleLibelle: string };
  fournisseur: {
    id: string;
    nom: string;
    paysOrigine: string;
    categories: string[];
    delaiMoyenJours: number | null;
  } | null;
}) {
  return {
    id: p.id,
    titre: p.titre,
    description: p.description ?? '',
    categorie: { id: p.categorie.id, slug: p.categorie.slug, libelle: p.categorie.cleLibelle },
    medias: p.medias,
    variantes: p.variantes,
    prixIndicatif: p.prixIndicatif === null || !p.devise ? null : { valeur: Number(p.prixIndicatif), devise: p.devise },
    mentionPrix: MENTION_PRIX,
    origine: p.fournisseur?.paysOrigine ?? '',
    delaiEstimeJours: p.fournisseur?.delaiMoyenJours ?? null,
    fournisseur: p.fournisseur
      ? {
          id: p.fournisseur.id,
          nom: p.fournisseur.nom,
          paysOrigine: p.fournisseur.paysOrigine,
          categories: p.fournisseur.categories,
          delaiMoyenJours: p.fournisseur.delaiMoyenJours,
        }
      : null,
    misEnAvant: p.misEnAvant,
  };
}

const relationsVisibles = {
  categorie: true,
  fournisseur: { select: { id: true, nom: true, paysOrigine: true, categories: true, delaiMoyenJours: true } },
} as const;

/** Lecture client publique et favoris persistants (US-CAT-01 à 05). Les tables existent déjà dans le schéma v1. */
@Controller()
export class CatalogueController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('categories')
  async listerCategories() {
    const categories = await this.prisma.categorie.findMany({
      where: { produits: { some: { etat: 'valide', fournisseur: { etat: 'valide' } } } },
      orderBy: [{ ordre: 'asc' }, { slug: 'asc' }],
    });
    return categories.map((c) => ({ id: c.id, slug: c.slug, libelle: c.cleLibelle }));
  }

  @Public()
  @Get('produits')
  async rechercher(
    @Query('q') q?: string,
    @Query('categorie') categorie?: string,
    @Query('prixMin') prixMin?: string,
    @Query('prixMax') prixMax?: string,
  ) {
    const prix = (valeur: string | undefined) => {
      if (valeur === undefined) return undefined;
      if (!/^\d+$/.test(valeur) || !Number.isSafeInteger(Number(valeur))) {
        throw invalide('Le filtre de prix doit être un entier positif.');
      }
      return BigInt(valeur);
    };
    const min = prix(prixMin);
    const max = prix(prixMax);
    if (min !== undefined && max !== undefined && min > max) {
      throw invalide('Le prix minimum ne peut pas dépasser le maximum.');
    }
    const produits = await this.prisma.produit.findMany({
      where: {
        etat: 'valide',
        fournisseur: { etat: 'valide' },
        ...(categorie ? { categorie: { slug: categorie } } : {}),
        ...(q?.trim() ? { titre: { contains: q.trim(), mode: 'insensitive' } } : {}),
        ...((min !== undefined || max !== undefined)
          ? {
              prixIndicatif: {
                not: null,
                ...(min !== undefined ? { gte: min } : {}),
                ...(max !== undefined ? { lte: max } : {}),
              },
            }
          : {}),
      },
      include: relationsVisibles,
      orderBy: [{ misEnAvant: 'desc' }, { creeLe: 'desc' }],
      take: 50,
    });
    return { elements: produits.map(exposerProduit), curseurSuivant: null };
  }

  @Public()
  @Get('produits/:id')
  async lireProduit(@Param('id') id: string) {
    const p = await this.prisma.produit.findFirst({
      where: { id, etat: 'valide', fournisseur: { etat: 'valide' } },
      include: relationsVisibles,
    });
    if (!p) throw introuvable('Produit introuvable.');
    return exposerProduit(p);
  }

  @Public()
  @Get('fournisseurs')
  async listerFournisseurs(@Query('pays') pays?: string, @Query('categorie') categorie?: string) {
    return this.prisma.fournisseur.findMany({
      where: {
        etat: 'valide',
        ...(pays ? { paysOrigine: pays.toUpperCase() } : {}),
        ...(categorie ? { categories: { has: categorie } } : {}),
      },
      select: { id: true, nom: true, paysOrigine: true, categories: true, delaiMoyenJours: true },
      orderBy: { nom: 'asc' },
      take: 100,
    });
  }

  @Roles('client')
  @Get('moi/favoris')
  async listerFavoris(@Utilisateur() utilisateur: UtilisateurConnecte) {
    const favoris = await this.prisma.favori.findMany({
      where: { utilisateurId: utilisateur.id, produit: { etat: 'valide', fournisseur: { etat: 'valide' } } },
      include: { produit: { include: relationsVisibles } },
      orderBy: { creeLe: 'desc' },
    });
    return favoris.map(({ produit }) => exposerProduit(produit));
  }

  @Roles('client')
  @Put('moi/favoris/:id')
  @HttpCode(204)
  async ajouterFavori(@Param('id') produitId: string, @Utilisateur() utilisateur: UtilisateurConnecte) {
    const produit = await this.prisma.produit.findFirst({
      where: { id: produitId, etat: 'valide', fournisseur: { etat: 'valide' } },
      select: { id: true },
    });
    if (!produit) throw introuvable('Produit introuvable.');
    await this.prisma.favori.upsert({
      where: { utilisateurId_produitId: { utilisateurId: utilisateur.id, produitId } },
      create: { utilisateurId: utilisateur.id, produitId },
      update: {},
    });
  }

  @Roles('client')
  @Delete('moi/favoris/:id')
  @HttpCode(204)
  async retirerFavori(@Param('id') produitId: string, @Utilisateur() utilisateur: UtilisateurConnecte) {
    await this.prisma.favori.deleteMany({ where: { utilisateurId: utilisateur.id, produitId } });
  }
}
