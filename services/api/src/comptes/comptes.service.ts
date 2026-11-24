import { Inject, Injectable } from '@nestjs/common';
import { PARRAINAGE_PAR_DEFAUT_XOF } from '@ss-dropship/types';
import { randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service.js';
import { introuvable, invalide, nonAuthentifie } from '../commun/erreurs.js';
import { CONFIGURATION, type Configuration } from '../config.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SessionsService } from '../auth/sessions.service.js';
import { normaliserTelephone } from '../securite/identite.js';
import { hacherMotDePasse, verifierMotDePasse } from '../securite/motdepasse.js';

export interface NouvelleAdresse {
  libelle: string;
  ville: string;
  quartier: string;
  repere?: string | undefined;
  telephoneDestinataire: string;
  parDefaut?: boolean | undefined;
}

@Injectable()
export class ComptesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
    private readonly audit: AuditService,
    @Inject(CONFIGURATION) private readonly config: Configuration,
  ) {}

  async profil(id: string) {
    const u = await this.prisma.utilisateur.findUniqueOrThrow({ where: { id } });
    return {
      id: u.id,
      nom: u.nom,
      telephone: u.telephone,
      email: u.email,
      pays: u.paysCode,
      langue: u.langue,
      roles: u.roles,
      mfaActive: u.mfaActive,
      preferencesNotification: u.preferencesNotification ?? {},
    };
  }

  async modifierProfil(
    id: string,
    d: {
      nom?: string | undefined;
      langue?: string | undefined;
      preferencesNotification?: Record<string, boolean> | undefined;
    },
  ) {
    await this.prisma.utilisateur.update({
      where: { id },
      data: {
        ...(d.nom ? { nom: d.nom.trim() } : {}),
        ...(d.langue ? { langue: d.langue } : {}),
        ...(d.preferencesNotification ? { preferencesNotification: d.preferencesNotification } : {}),
      },
    });
    return this.profil(id);
  }

  async adresses(utilisateurId: string) {
    return this.prisma.adresse.findMany({
      where: { utilisateurId },
      orderBy: [{ parDefaut: 'desc' }, { creeLe: 'asc' }],
      select: {
        id: true,
        libelle: true,
        paysCode: true,
        ville: true,
        quartier: true,
        repere: true,
        telephoneDestinataire: true,
        parDefaut: true,
      },
    });
  }

  async ajouterAdresse(utilisateurId: string, d: NouvelleAdresse) {
    const u = await this.prisma.utilisateur.findUniqueOrThrow({ where: { id: utilisateurId } });
    const tel = normaliserTelephone(d.telephoneDestinataire, u.paysCode);
    if (!tel) throw invalide('Téléphone du destinataire invalide.', { champs: { telephoneDestinataire: 'invalide' } });
    const premiere = (await this.prisma.adresse.count({ where: { utilisateurId } })) === 0;
    const parDefaut = premiere || Boolean(d.parDefaut);
    return this.prisma.$transaction(async (tx) => {
      if (parDefaut) await tx.adresse.updateMany({ where: { utilisateurId }, data: { parDefaut: false } });
      return tx.adresse.create({
        data: {
          utilisateurId,
          libelle: d.libelle,
          paysCode: u.paysCode,
          ville: d.ville,
          quartier: d.quartier,
          repere: d.repere ?? null,
          telephoneDestinataire: tel,
          parDefaut,
        },
        select: {
          id: true,
          libelle: true,
          paysCode: true,
          ville: true,
          quartier: true,
          repere: true,
          telephoneDestinataire: true,
          parDefaut: true,
        },
      });
    });
  }

  async supprimerAdresse(utilisateurId: string, id: string): Promise<void> {
    const { count } = await this.prisma.adresse.deleteMany({ where: { id, utilisateurId } });
    if (!count) throw introuvable('Adresse introuvable.');
  }

  /** US-AUT-06 : code, lien de partage, filleuls et récompenses (sans données personnelles des filleuls). */
  async parrainage(utilisateurId: string) {
    const [code, filleuls, recompenses] = await Promise.all([
      this.prisma.codeParrainage.findUnique({ where: { utilisateurId } }),
      this.prisma.parrainage.count({ where: { parrainId: utilisateurId } }),
      this.prisma.recompenseParrainage.groupBy({
        by: ['etat', 'devise'],
        where: { parrainage: { parrainId: utilisateurId } },
        _sum: { montant: true },
      }),
    ]);
    const somme = (etat: string) =>
      Number(recompenses.filter((r) => r.etat === etat).reduce((t, r) => t + (r._sum.montant ?? 0n), 0n));
    const devise = recompenses[0]?.devise ?? 'XOF';
    const { tauxPb, dureeMois } = PARRAINAGE_PAR_DEFAUT_XOF;
    return {
      code: code?.code ?? null,
      lienPartage: code ? `${this.config.URL_WEB}/inscription?parrain=${encodeURIComponent(code.code)}` : null,
      nombreFilleuls: filleuls,
      recompensesVersees: { valeur: somme('versee'), devise },
      recompensesEnAttente: { valeur: somme('en_revue'), devise },
      regle: { tauxPb, dureeMois },
    };
  }

  /** US-AUT-08 : export des données personnelles (sans empreintes ni secrets). */
  async exporter(utilisateurId: string) {
    const u = await this.prisma.utilisateur.findUniqueOrThrow({
      where: { id: utilisateurId },
      include: {
        adresses: true,
        codeParrainage: true,
        parrainage: { select: { creeLe: true, codeUtilise: true } },
        sessions: { select: { appareil: true, creeLe: true, revoqueLe: true } },
      },
    });
    const { motDePasseHash: _h, mfaSecretChiffre: _s, ...donnees } = u;
    return { exporteLe: new Date().toISOString(), compte: donnees };
  }

  /** US-AUT-08 : suppression = anonymisation ; les écritures financières sont conservées (obligation légale). */
  async supprimer(utilisateurId: string, motDePasse: string): Promise<void> {
    const u = await this.prisma.utilisateur.findUniqueOrThrow({ where: { id: utilisateurId } });
    if (!(await verifierMotDePasse(u.motDePasseHash, motDePasse))) {
      throw nonAuthentifie('mot_de_passe_invalide', 'Mot de passe incorrect.');
    }
    await this.prisma.$transaction([
      this.prisma.adresse.deleteMany({ where: { utilisateurId } }),
      this.prisma.utilisateur.update({
        where: { id: utilisateurId },
        data: {
          nom: 'Compte supprimé',
          telephone: null,
          // Domaine réservé « .invalid » : adresse impossible, garde la contrainte « au moins un contact ».
          email: `supprime-${utilisateurId}@supprime.invalid`,
          motDePasseHash: await hacherMotDePasse(randomBytes(32).toString('hex')),
          mfaSecretChiffre: null,
          mfaActive: false,
          preferencesNotification: undefined,
          etat: 'supprime',
          supprimeLe: new Date(),
        },
      }),
    ]);
    await this.sessions.fermerToutes(utilisateurId);
    await this.audit.journaliser({
      acteurId: utilisateurId,
      action: 'compte.suppression',
      objetType: 'Utilisateur',
      objetId: utilisateurId,
    });
  }
}
