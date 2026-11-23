// Modules du back-office, rattachés aux épopées du backlog et aux rôles habilités (ADR-004).
export interface ModuleAdmin {
  cle: string;
  titre: string;
  description: string;
  roles: readonly string[];
  sprint: string;
}

export const MODULES: readonly ModuleAdmin[] = [
  {
    cle: 'demandes',
    titre: 'Demandes et devis',
    description: 'File des agents, offres, négociation',
    roles: ['agent_achat', 'admin'],
    sprint: 'S3–S4',
  },
  {
    cle: 'commandes',
    titre: 'Commandes',
    description: 'États, achats, factures',
    roles: ['agent_achat', 'admin'],
    sprint: 'S5',
  },
  {
    cle: 'wallet',
    titre: 'Wallet et paiements',
    description: 'Ledger, recharges, rapprochement',
    roles: ['comptable', 'admin'],
    sprint: 'S6',
  },
  {
    cle: 'entrepot',
    titre: 'Entrepôt',
    description: 'Réception des cartons fermés',
    roles: ['agent_entrepot', 'admin'],
    sprint: 'S7',
  },
  {
    cle: 'transport',
    titre: 'Transport',
    description: 'Transitaires, grilles, suivi',
    roles: ['logistique', 'admin'],
    sprint: 'S8',
  },
  { cle: 'support', titre: 'Support', description: 'Tickets et litiges', roles: ['support', 'admin'], sprint: 'S9' },
  {
    cle: 'parametres',
    titre: 'Paramètres',
    description: 'Frais, change, parrainage, pays',
    roles: ['admin'],
    sprint: 'S10',
  },
  { cle: 'audit', titre: "Journal d'audit", description: 'Qui a fait quoi, quand', roles: ['admin'], sprint: 'S10' },
];
