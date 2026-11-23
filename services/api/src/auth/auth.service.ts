import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
  TooManyRequestsException, UnauthorizedException,
} from '@nestjs/common';
import { validerInscription, type SaisieInscription, normaliserTelephoneMali } from '@ss-dropship/types';
import { randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { comparerCode, empreinteCode, empreinteJeton, nouveauCode, nouveauJeton } from './jetons.js';
import { hacherMotDePasse, verifierMotDePasse } from './mots-de-passe.js';
import { NotificationAuthService } from './notification-auth.service.js';

const DUREE_OTP_MS = 10 * 60_000;
const DUREE_SESSION_MS = 7 * 24 * 60 * 60_000;

/** Gestion des utilisateurs S1 : aucune récompense n'est créditée à l'inscription. */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationAuthService,
    private readonly audit: AuditService,
  ) {}

  async inscrire(saisie: SaisieInscription) {
    const validation = validerInscription(saisie);
    if (!validation.valide) throw new BadRequestException({ code: 'inscription_invalide', erreurs: validation.erreurs });
    const { nom, email, telephone, codeParrainage } = validation.champs;
    const [compte, parrain] = await Promise.all([
      this.prisma.utilisateur.findFirst({
        where: { OR: [
          ...(email ? [{ email }] : []),
          ...(telephone ? [{ telephone }] : []),
        ] },
        select: { id: true },
      }),
      codeParrainage ? this.prisma.codeParrainage.findUnique({
        where: { code: codeParrainage }, select: { utilisateurId: true },
      }) : Promise.resolve(null),
    ]);
    if (compte) throw new ConflictException('Ce contact est déjà utilisé');
    if (codeParrainage && !parrain) throw new BadRequestException('Code de parrainage inconnu');

    const motDePasseHash = await hacherMotDePasse(saisie.motDePasse);
    const code = nouveauCode();
    const canal = telephone ? 'sms' : 'email';
    const destinataire = telephone ?? email;
    if (!destinataire) throw new BadRequestException('Contact manquant');
    const reference = randomBytes(7).toString('hex').toUpperCase();
    // Unicité finale assurée par les contraintes en base ; transaction atomique.
    let utilisateur: { id: string };
    try {
      utilisateur = await this.prisma.$transaction(async (tx) => {
        const user = await tx.utilisateur.create({
          data: {
            nom, email, telephone, paysCode: 'ML', motDePasseHash,
            etat: 'a_verifier', roles: ['client'], cguAccepteesLe: new Date(),
          },
          select: { id: true },
        });
        await tx.codeParrainage.create({ data: { utilisateurId: user.id, code: reference } });
        if (parrain) await tx.parrainage.create({
          data: { parrainId: parrain.utilisateurId, filleulId: user.id, codeUtilise: codeParrainage! },
        });
        await tx.codeVerification.create({
          data: {
            utilisateurId: user.id, objet: canal === 'sms' ? 'telephone' : 'email',
            codeHash: empreinteCode(code), expireLe: new Date(Date.now() + DUREE_OTP_MS),
          },
        });
        return user;
      });
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'P2002') {
        throw new ConflictException('Contact ou code déjà utilisé');
      }
      throw e;
    }
    await this.audit.journaliser({
      acteurId: utilisateur.id, action: 'compte.inscription', objetType: 'utilisateur', objetId: utilisateur.id,
    });
    // En absence de prestataire, l'API répond 503 plutôt que prétendre que le code a été envoyé.
    await this.notification.envoyerCode({ canal, destinataire, code, dureeMinutes: 10 });
    return { utilisateurId: utilisateur.id, etat: 'a_verifier' as const, canal };
  }

  async verifierContact(utilisateurId: string, code: string) {
    if (!/^[0-9]{6}$/.test(code)) throw new BadRequestException('Code invalide');
    // La transaction sérialisable évite deux validations concurrentes et garde le compteur de tentatives en base.
    const etat = await this.prisma.$transaction(async (tx) => {
      const compte = await tx.utilisateur.findUnique({
        where: { id: utilisateurId }, select: { id: true, etat: true },
      });
      if (!compte || compte.etat !== 'a_verifier') throw new BadRequestException('Compte non vérifiable');
      const dernier = await tx.codeVerification.findFirst({
        where: { utilisateurId, utiliseLe: null, objet: { in: ['email', 'telephone'] } },
        orderBy: { creeLe: 'desc' },
      });
      if (!dernier || dernier.expireLe.getTime() < Date.now()) throw new BadRequestException('Code expiré');
      if (dernier.tentatives >= 5) throw new TooManyRequestsException('Trop de tentatives');
      const correct = comparerCode(code, dernier.codeHash);
      await tx.codeVerification.update({
        where: { id: dernier.id },
        data: { tentatives: { increment: 1 }, ...(correct ? { utiliseLe: new Date() } : {}) },
      });
      if (!correct) return 'invalide' as const;
      await tx.utilisateur.update({ where: { id: utilisateurId }, data: { etat: 'actif' } });
      return 'actif' as const;
    }, { isolationLevel: 'Serializable' });
    if (etat !== 'actif') throw new BadRequestException('Code incorrect');
    await this.audit.journaliser({
      acteurId: utilisateurId, action: 'compte.verification', objetType: 'utilisateur', objetId: utilisateurId,
    });
    return { etat };
  }

  async connecter(identifiant: string, motDePasse: string) {
    const texte = identifiant.trim().toLowerCase();
    const telephone = normaliserTelephoneMali(texte);
    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: { OR: [
        ...(telephone ? [{ telephone }] : []),
        { email: texte },
      ] },
      select: { id: true, etat: true, roles: true, motDePasseHash: true },
    });
    if (!utilisateur || !(await verifierMotDePasse(motDePasse, utilisateur.motDePasseHash))) {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    if (utilisateur.etat !== 'actif') throw new UnauthorizedException('Compte non actif');
    // Aucun compte administrateur sans MFA effectif. L'authentification MFA sera implémentée séparément.
    if (utilisateur.roles.includes('admin')) throw new UnauthorizedException('Connexion administrateur indisponible sans MFA');
    const jeton = nouveauJeton();
    const session = await this.prisma.session.create({
      data: {
        utilisateurId: utilisateur.id, jetonHash: empreinteJeton(jeton),
        expireLe: new Date(Date.now() + DUREE_SESSION_MS),
      },
      select: { id: true, expireLe: true },
    });
    await this.audit.journaliser({
      acteurId: utilisateur.id, action: 'session.creation', objetType: 'session', objetId: session.id,
    });
    return { jetonSession: jeton, expireLe: session.expireLe.toISOString(), type: 'Bearer' as const };
  }

  async session(jeton: string) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(jeton)) throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { jetonHash: empreinteJeton(jeton) },
      include: { utilisateur: { select: { id: true, nom: true, etat: true, roles: true } } },
    });
    if (!session || session.revoqueLe || session.expireLe.getTime() <= Date.now()
      || session.utilisateur.etat !== 'actif') throw new UnauthorizedException();
    return { id: session.id, utilisateur: session.utilisateur };
  }

  async profil(jeton: string) {
    const { utilisateur } = await this.session(jeton);
    return utilisateur;
  }

  async deconnecter(jeton: string) {
    const session = await this.session(jeton);
    await this.prisma.session.updateMany({
      where: { id: session.id, revoqueLe: null },
      data: { revoqueLe: new Date() },
    });
    await this.audit.journaliser({
      acteurId: session.utilisateur.id, action: 'session.revocation',
      objetType: 'session', objetId: session.id,
    });
    return { deconnecte: true };
  }

  async parrainage(jeton: string) {
    const { utilisateur } = await this.session(jeton);
    const code = await this.prisma.codeParrainage.findUnique({ where: { utilisateurId: utilisateur.id } });
    if (!code) throw new NotFoundException('Code de parrainage indisponible');
    const nombreFilleuls = await this.prisma.parrainage.count({ where: { parrainId: utilisateur.id } });
    // Aucune récompense avant une commande effectivement livrée et réglée.
    return { code: code.code, nombreFilleuls, recompenses: 'Non calculées avant livraison' };
  }
}
