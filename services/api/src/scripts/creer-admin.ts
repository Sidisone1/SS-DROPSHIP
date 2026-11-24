// Crée le premier administrateur (aucune inscription publique ne donne ce rôle).
// Usage : ADMIN_EMAIL=… ADMIN_MOT_DE_PASSE=… ADMIN_NOM=… DATABASE_URL=… node dist/scripts/creer-admin.js
// À la première connexion, l'administrateur doit activer la double authentification (ADR-004).
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { normaliserEmail } from '../securite/identite.js';
import { hacherMotDePasse, verifierRobustesse } from '../securite/motdepasse.js';

const email = normaliserEmail(process.env.ADMIN_EMAIL ?? '');
const motDePasse = process.env.ADMIN_MOT_DE_PASSE ?? '';
const nom = process.env.ADMIN_NOM ?? 'Administrateur';
if (!email) throw new Error('ADMIN_EMAIL invalide');
const faiblesse = verifierRobustesse(motDePasse);
if (faiblesse || motDePasse.length < 12)
  throw new Error(`ADMIN_MOT_DE_PASSE refusé : ${faiblesse ?? '12 caractères minimum'}`);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }) });
const existe = await prisma.utilisateur.findUnique({ where: { email } });
if (existe) {
  console.error('Un compte existe déjà avec cet email ; utilisez PUT /v1/admin/utilisateurs/:id/roles.');
  process.exitCode = 1;
} else {
  const u = await prisma.utilisateur.create({
    data: {
      nom,
      email,
      motDePasseHash: await hacherMotDePasse(motDePasse),
      paysCode: 'ML',
      etat: 'actif',
      roles: ['admin'],
      cguAccepteesLe: new Date(),
    },
  });
  await prisma.journalAudit.create({
    data: {
      action: 'role.attribution',
      objetType: 'Utilisateur',
      objetId: u.id,
      apres: { roles: ['admin'], source: 'script creer-admin' },
    },
  });
  console.log(`Administrateur créé (${u.id}). Activez la double authentification à la première connexion.`);
}
await prisma.$disconnect();
