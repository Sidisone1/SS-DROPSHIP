import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { configPays } from '@ss-dropship/config';
import { AuditService } from '../audit/audit.service.js';
import { conflit, ErreurMetier, interdit, invalide, nonAuthentifie } from '../commun/erreurs.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { chiffrer, dechiffrer } from '../securite/chiffrement.js';
import {
  genererCodeParrainage,
  normaliserCodeParrainage,
  normaliserEmail,
  normaliserIdentifiant,
  normaliserTelephone,
} from '../securite/identite.js';
import { hacherMotDePasse, verifierMotDePasse, verifierRobustesse } from '../securite/motdepasse.js';
import { genererSecretTotp, urlOtpauth, verifierTotp } from '../securite/totp.js';
import { CLES, type Cles } from './cles.js';
import { CodesVerificationService } from './codes-verification.service.js';
import { type Jetons, SessionsService } from './sessions.service.js';

export interface DonneesInscription {
  nom: string;
  telephone?: string | undefined;
  email?: string | undefined;
  pays: string;
  motDePasse: string;
  codeParrainage?: string | undefined;
}

// Empreinte factice : la vérification d'un compte inexistant prend le même temps (pas de révélation d'existence).
const EMPREINTE_FACTICE = hacherMotDePasse('compte-inexistant-0000');

const estPersonnel = (roles: readonly string[]) => roles.some((r) => r !== 'client');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
    private readonly codes: CodesVerificationService,
    private readonly audit: AuditService,
    @Inject(CLES) private readonly cles: Cles,
  ) {}

  /** US-AUT-01 : création du compte, code de parrainage personnel, lien avec le parrain si le code est valide. */
  async inscrire(d: DonneesInscription) {
    let pays: ReturnType<typeof configPays>;
    try {
      pays = configPays(d.pays);
    } catch {
      throw invalide('Pays inconnu.', { champs: { pays: 'inconnu' } });
    }
    if (!pays.ouvert) throw invalide("Ce pays n'est pas encore ouvert.", { champs: { pays: 'ferme' } });

    const telephone = d.telephone ? normaliserTelephone(d.telephone, pays.code) : null;
    const email = d.email ? normaliserEmail(d.email) : null;
    if (d.telephone && !telephone)
      throw invalide('Numéro de téléphone invalide.', { champs: { telephone: 'invalide' } });
    if (d.email && !email) throw invalide('Adresse email invalide.', { champs: { email: 'invalide' } });
    if (!telephone && !email) throw invalide('Indiquez un téléphone ou un email.', { champs: { telephone: 'requis' } });
    const faiblesse = verifierRobustesse(d.motDePasse);
    if (faiblesse) throw invalide(faiblesse, { champs: { motDePasse: 'faible' } });

    const existe = await this.prisma.utilisateur.findFirst({
      where: { OR: [...(telephone ? [{ telephone }] : []), ...(email ? [{ email }] : [])] },
      select: { id: true },
    });
    if (existe) throw conflit('compte_existant', 'Un compte existe déjà avec ce téléphone ou cet email.');

    // Parrain : code existant, compte actif (anti-fraude D-023 ; un nouveau compte ne peut pas se parrainer lui-même).
    let parrainId: string | null = null;
    let avertissement: string | undefined;
    if (d.codeParrainage?.trim()) {
      const code = normaliserCodeParrainage(d.codeParrainage);
      const trouve = await this.prisma.codeParrainage.findUnique({
        where: { code },
        select: { utilisateurId: true, utilisateur: { select: { etat: true } } },
      });
      if (trouve && trouve.utilisateur.etat === 'actif') parrainId = trouve.utilisateurId;
      else avertissement = 'Ce code de parrainage est invalide. Votre compte a été créé sans parrain.';
    }

    const motDePasseHash = await hacherMotDePasse(d.motDePasse);
    const utilisateur = await this.prisma.$transaction(async (tx) => {
      const u = await tx.utilisateur.create({
        data: {
          nom: d.nom.trim(),
          telephone,
          email,
          motDePasseHash,
          paysCode: pays.code,
          langue: pays.langue,
          cguAccepteesLe: new Date(),
        },
      });
      let code = '';
      for (let essai = 0; essai < 8 && !code; essai++) {
        const candidat = genererCodeParrainage(d.nom);
        if (!(await tx.codeParrainage.findUnique({ where: { code: candidat }, select: { code: true } })))
          code = candidat;
      }
      await tx.codeParrainage.create({ data: { code, utilisateurId: u.id } });
      if (parrainId) {
        await tx.parrainage.create({
          data: { parrainId, filleulId: u.id, codeUtilise: normaliserCodeParrainage(d.codeParrainage ?? '') },
        });
      }
      // Comptes wallet ouverts sans aucune écriture : le crédit ne viendra que d'un webhook (D-008, sprint S6).
      await tx.compteWallet.createMany({
        data: [
          { type: 'client_principal', utilisateurId: u.id, devise: pays.devise },
          { type: 'client_recompenses', utilisateurId: u.id, devise: pays.devise },
        ],
      });
      return u;
    });

    const canalVerification = await this.codes.emettre(utilisateur, telephone ? 'telephone' : 'email');
    await this.audit.journaliser({
      acteurId: utilisateur.id,
      action: 'compte.creation',
      objetType: 'Utilisateur',
      objetId: utilisateur.id,
      apres: { pays: pays.code, parrainage: Boolean(parrainId) },
    });
    return {
      utilisateurId: utilisateur.id,
      parrainageEnregistre: Boolean(parrainId),
      canalVerification,
      ...(avertissement ? { avertissement } : {}),
    };
  }

  /** US-AUT-02 : validation du contact par le code reçu. */
  async verifierContact(utilisateurId: string, code: string): Promise<void> {
    const u = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (u?.etat !== 'a_verifier') throw invalide('Aucune vérification en attente pour ce compte.');
    await this.codes.consommer(u.id, u.telephone ? 'telephone' : 'email', code);
    await this.prisma.utilisateur.update({ where: { id: u.id }, data: { etat: 'actif' } });
    await this.audit.journaliser({
      acteurId: u.id,
      action: 'compte.verification',
      objetType: 'Utilisateur',
      objetId: u.id,
    });
  }

  async renvoyerCode(utilisateurId: string): Promise<'sms' | 'email'> {
    const u = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (u?.etat !== 'a_verifier') throw invalide('Aucune vérification en attente pour ce compte.');
    return this.codes.emettre(u, u.telephone ? 'telephone' : 'email');
  }

  /** US-AUT-03 : connexion ; double authentification obligatoire pour le personnel (ADR-004). */
  async connecter(
    identifiant: string,
    motDePasse: string,
    codeMfa: string | undefined,
    appareil?: string,
  ): Promise<Jetons> {
    const critere = normaliserIdentifiant(identifiant);
    const u = critere.telephone || critere.email ? await this.prisma.utilisateur.findFirst({ where: critere }) : null;
    const valide = await verifierMotDePasse(u?.motDePasseHash ?? (await EMPREINTE_FACTICE), motDePasse);
    if (!u || !valide) throw nonAuthentifie('identifiants_invalides', 'Identifiant ou mot de passe incorrect.');
    if (u.etat === 'a_verifier') {
      throw interdit('compte_non_verifie', 'Confirmez votre téléphone ou votre email pour continuer.', {
        utilisateurId: u.id,
      });
    }
    if (u.etat !== 'actif') throw interdit('compte_inactif', 'Ce compte est suspendu ou fermé.');

    const roles = u.roles as string[];
    let portee: 'complet' | 'configuration_mfa' = 'complet';
    if (estPersonnel(roles)) {
      if (u.mfaActive && u.mfaSecretChiffre) {
        if (!codeMfa) throw nonAuthentifie('mfa_requise', 'Saisissez le code de votre application d’authentification.');
        if (!verifierTotp(codeMfa, dechiffrer(u.mfaSecretChiffre, this.cles.mfa))) {
          throw nonAuthentifie('mfa_invalide', 'Code de double authentification incorrect.');
        }
      } else {
        portee = 'configuration_mfa';
      }
    }
    const jetons = await this.sessions.ouvrir({ id: u.id, roles }, portee, appareil);
    await this.prisma.utilisateur.update({ where: { id: u.id }, data: { derniereConnexionLe: new Date() } });
    if (estPersonnel(roles)) {
      await this.audit.journaliser({
        acteurId: u.id,
        roleActeur: roles.join(','),
        action: 'session.connexion',
        objetType: 'Utilisateur',
        objetId: u.id,
        apres: { portee },
      });
    }
    return jetons;
  }

  /** US-AUT-04 : réponse identique que le compte existe ou non. */
  async demanderReinitialisation(identifiant: string): Promise<void> {
    const critere = normaliserIdentifiant(identifiant);
    if (!critere.telephone && !critere.email) return;
    const u = await this.prisma.utilisateur.findFirst({ where: { ...critere, etat: 'actif' } });
    if (!u) return;
    try {
      await this.codes.emettre(u, 'mot_de_passe');
    } catch {
      // Blocage en cours : on ne le révèle pas.
    }
  }

  async reinitialiser(identifiant: string, code: string, nouveauMotDePasse: string): Promise<void> {
    const faiblesse = verifierRobustesse(nouveauMotDePasse);
    if (faiblesse) throw invalide(faiblesse, { champs: { nouveauMotDePasse: 'faible' } });
    const critere = normaliserIdentifiant(identifiant);
    const u =
      critere.telephone || critere.email
        ? await this.prisma.utilisateur.findFirst({ where: { ...critere, etat: 'actif' } })
        : null;
    if (!u) throw new ErreurMetier(HttpStatus.UNPROCESSABLE_ENTITY, 'code_invalide', 'Code incorrect.');
    await this.codes.consommer(u.id, 'mot_de_passe', code);
    await this.prisma.utilisateur.update({
      where: { id: u.id },
      data: { motDePasseHash: await hacherMotDePasse(nouveauMotDePasse) },
    });
    await this.sessions.fermerToutes(u.id);
    await this.audit.journaliser({
      acteurId: u.id,
      action: 'compte.reinitialisation',
      objetType: 'Utilisateur',
      objetId: u.id,
    });
  }

  /** Activation de la double authentification (personnel) : secret généré, stocké chiffré, non actif avant confirmation. */
  async preparerMfa(utilisateurId: string) {
    const u = await this.prisma.utilisateur.findUniqueOrThrow({ where: { id: utilisateurId } });
    if (!estPersonnel(u.roles as string[])) throw interdit('reserve_au_personnel', 'Réservé au personnel.');
    if (u.mfaActive) throw conflit('mfa_deja_active', 'La double authentification est déjà active.');
    const secret = genererSecretTotp();
    await this.prisma.utilisateur.update({
      where: { id: u.id },
      data: { mfaSecretChiffre: chiffrer(secret, this.cles.mfa) },
    });
    return { secret, urlOtpauth: urlOtpauth(secret, u.email ?? u.telephone ?? u.id) };
  }

  async confirmerMfa(utilisateurId: string, code: string): Promise<void> {
    const u = await this.prisma.utilisateur.findUniqueOrThrow({ where: { id: utilisateurId } });
    if (u.mfaActive) throw conflit('mfa_deja_active', 'La double authentification est déjà active.');
    if (!u.mfaSecretChiffre) throw invalide('Lancez d’abord l’activation.');
    if (!verifierTotp(code, dechiffrer(u.mfaSecretChiffre, this.cles.mfa))) {
      throw new ErreurMetier(HttpStatus.UNPROCESSABLE_ENTITY, 'mfa_invalide', 'Code incorrect.');
    }
    await this.prisma.utilisateur.update({ where: { id: u.id }, data: { mfaActive: true } });
    // Les sessions ouvertes sans double authentification sont fermées : reconnexion avec le code.
    await this.sessions.fermerToutes(u.id);
    await this.audit.journaliser({
      acteurId: u.id,
      roleActeur: (u.roles as string[]).join(','),
      action: 'mfa.activation',
      objetType: 'Utilisateur',
      objetId: u.id,
    });
  }
}
