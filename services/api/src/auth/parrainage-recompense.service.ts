import { Injectable } from '@nestjs/common';
import { calculerRecompense, montant, PARRAINAGE_PAR_DEFAUT_XOF } from '@ss-dropship/types';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * S1 : préparation automatique de la récompense après livraison.
 * Ce service est interne, non exposé en HTTP. Le déclencheur devra être
 * le futur flux de transition de commande (S5) APRÈS paiement contrôlé.
 *
 * On conserve le statut "en_revue" : aucune écriture financière ni crédit
 * wallet n'est effectuée avant le travail de ledger sécurisé (S6).
 */
@Injectable()
export class ParrainageRecompenseService {
  constructor(private readonly prisma: PrismaService) {}

  async preparerApresLivraison(
    commandeId: string,
  ): Promise<{ statut: 'non_eligible' | 'deja_preparee' | 'en_revue'; recompenseId?: string }> {
    if (!commandeId || typeof commandeId !== 'string') return { statut: 'non_eligible' };
    const commande = await this.prisma.commande.findUnique({
      where: { id: commandeId },
      select: { id: true, clientId: true, etat: true, devise: true, offreAccepteeId: true },
    });
    if (!commande || commande.etat !== 'livree' || !commande.offreAccepteeId) {
      return { statut: 'non_eligible' };
    }
    const deja = await this.prisma.recompenseParrainage.findUnique({
      where: { commandeId },
      select: { id: true },
    });
    if (deja) return { statut: 'deja_preparee', recompenseId: deja.id };
    const [parrainage, offre, livraison] = await Promise.all([
      this.prisma.parrainage.findUnique({
        where: { filleulId: commande.clientId },
        select: { id: true, parrainId: true, filleulId: true, creeLe: true },
      }),
      this.prisma.offre.findUnique({
        where: { id: commande.offreAccepteeId },
        select: { fraisService: true, devise: true },
      }),
      this.prisma.evenementCommande.findFirst({
        where: { commandeId, vers: 'livree' },
        orderBy: { creeLe: 'desc' },
        select: { creeLe: true },
      }),
    ]);
    if (
      !parrainage ||
      !offre ||
      !livraison ||
      offre.devise !== commande.devise ||
      offre.devise !== 'XOF' ||
      offre.fraisService < 0n ||
      offre.fraisService > BigInt(Number.MAX_SAFE_INTEGER)
    ) {
      return { statut: 'non_eligible' };
    }
    const resultat = calculerRecompense({
      parametres: PARRAINAGE_PAR_DEFAUT_XOF,
      commande: {
        etat: commande.etat,
        fraisServicePayes: montant(Number(offre.fraisService), 'XOF'),
        dateLivraison: livraison.creeLe,
      },
      inscriptionFilleul: parrainage.creeLe,
      parrainId: parrainage.parrainId,
      filleulId: parrainage.filleulId,
      // Aucun versement automatique encore : tout montant passe par la revue comptable.
      dejaVerseCeMois: montant(0, 'XOF'),
    });
    if (resultat.statut === 'aucune') return { statut: 'non_eligible' };
    try {
      const recompense = await this.prisma.recompenseParrainage.create({
        data: {
          parrainageId: parrainage.id,
          commandeId,
          montant: BigInt(resultat.montant.valeur),
          devise: resultat.montant.devise,
          tauxPb: PARRAINAGE_PAR_DEFAUT_XOF.tauxPb,
          etat: 'en_revue',
        },
        select: { id: true },
      });
      return { statut: 'en_revue', recompenseId: recompense.id };
    } catch (erreur) {
      if (typeof erreur === 'object' && erreur !== null && 'code' in erreur && erreur.code === 'P2002') {
        return { statut: 'deja_preparee' };
      }
      throw erreur;
    }
  }
}
