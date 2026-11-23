// Tests des contrats partagés. Lancer : node --test packages/types/src/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ETATS_COMMANDE, transitionner, peutTransiter, transitionsPossibles, TransitionInterdite, paiementCreditable,
  ETATS_PAIEMENT,
  montant, appliquerTaux, fraisDeService, convertir, poidsTaxableGrammes, fret, formater,
  calculerRecompense, ajouterMois, PARRAINAGE_PAR_DEFAUT_XOF,
  verifierOptionCommandable, OPTIONS_ENTREPOT, OptionIndisponible, LIBELLE_INDISPONIBLE,
} from './index.ts';

// ─── Machines à états ───────────────────────────────────────────────────────

test('parcours nominal d\'une commande jusqu\'à la livraison', () => {
  const parcours = [
    'brouillon', 'devis_demande', 'devis_propose', 'devis_accepte', 'payee', 'achat_en_cours',
    'expediee_fournisseur', 'recue_entrepot', 'en_attente_paiement_fret', 'prete_a_expedier',
    'remise_transporteur', 'en_transit', 'en_douane', 'arrivee_pays', 'disponible_retrait', 'livree',
  ] as const;
  parcours.slice(1).forEach((vers, i) => {
    assert.equal(transitionner('commande', parcours[i] ?? 'brouillon', vers), vers);
  });
});

test('annulation possible avant l\'achat, refusée après (US-CMD-06)', () => {
  assert.ok(peutTransiter('commande', 'payee', 'annulee'));
  assert.ok(!peutTransiter('commande', 'achat_en_cours', 'annulee'));
  assert.throws(() => transitionner('commande', 'achat_en_cours', 'annulee'), TransitionInterdite);
});

test('impossible de sauter des étapes ou de revenir d\'une livraison', () => {
  assert.throws(() => transitionner('commande', 'devis_propose', 'payee'), TransitionInterdite);
  assert.throws(() => transitionner('commande', 'recue_entrepot', 'remise_transporteur'), TransitionInterdite);
  assert.deepEqual(transitionsPossibles('commande', 'livree'), ['litige']);
  assert.deepEqual(transitionsPossibles('commande', 'remboursee'), []);
});

test('chaque état de commande a une entrée dans la table des transitions', () => {
  for (const etat of ETATS_COMMANDE) {
    assert.ok(Array.isArray(transitionsPossibles('commande', etat)), `état sans table : ${etat}`);
  }
});

test('seul un paiement confirmé est créditable, et il est définitif (D-008)', () => {
  for (const etat of ETATS_PAIEMENT) assert.equal(paiementCreditable(etat), etat === 'confirmee');
  assert.deepEqual(transitionsPossibles('paiement', 'confirmee'), []);
  // Un succès tardif sur un paiement expiré passe en anomalie, jamais directement en confirmé.
  assert.ok(!peutTransiter('paiement', 'expiree', 'confirmee'));
  assert.ok(peutTransiter('paiement', 'expiree', 'anomalie'));
});

test('un colis ne peut être expédié qu\'après réception et mesure', () => {
  assert.throws(() => transitionner('colis', 'attendu', 'expedie'), TransitionInterdite);
  assert.equal(transitionner('colis', 'mesure', 'pret'), 'pret');
});

// ─── Montants ───────────────────────────────────────────────────────────────

test('les montants sont des entiers', () => {
  assert.throws(() => montant(10.5, 'XOF'), RangeError);
  assert.deepEqual(montant(125_000, 'XOF'), { valeur: 125_000, devise: 'XOF' });
});

test('application d\'un taux en points de base, arrondi au plus proche', () => {
  assert.equal(appliquerTaux(100_000, 500), 5_000); // 5 %
  assert.equal(appliquerTaux(333, 500), 17); // 16,65 → 17
  assert.equal(appliquerTaux(330, 500), 17); // 16,5 → 17 (moitié vers le haut)
  assert.throws(() => appliquerTaux(-1, 500), RangeError);
});

test('frais de service : le minimum s\'applique sur les petites commandes (US-DEV-04)', () => {
  const minimum = montant(2_000, 'XOF');
  assert.equal(fraisDeService(montant(200_000, 'XOF'), 800, minimum).valeur, 16_000);
  assert.equal(fraisDeService(montant(10_000, 'XOF'), 800, minimum).valeur, 2_000);
  assert.throws(() => fraisDeService(montant(1, 'EUR'), 800, minimum), TypeError);
});

test('conversion : yuan vers FCFA avec marge de change', () => {
  // 1 CNY = 85,50 XOF (taux d'exemple). 100,00 CNY = 10 000 unités mineures.
  assert.deepEqual(convertir(montant(10_000, 'CNY'), 'XOF', 85_500_000), { valeur: 8_550, devise: 'XOF' });
  // Avec 2 % de marge : 87,21 XOF par CNY.
  assert.equal(convertir(montant(10_000, 'CNY'), 'XOF', 85_500_000, 200).valeur, 8_721);
  // Euro → FCFA (parité fixe 655,957).
  assert.equal(convertir(montant(10_000, 'EUR'), 'XOF', 655_957_000).valeur, 65_596);
});

test('poids taxable : le volumétrique l\'emporte pour un carton léger et volumineux', () => {
  // 60×40×40 cm / 6000 = 16 kg volumétrique > 5 kg réel.
  assert.equal(poidsTaxableGrammes(5_000, { longueur: 60, largeur: 40, hauteur: 40 }, 6000), 16_000);
  assert.equal(poidsTaxableGrammes(20_000, { longueur: 60, largeur: 40, hauteur: 40 }, 6000), 20_000);
  assert.throws(() => poidsTaxableGrammes(1_000, { longueur: 0, largeur: 10, hauteur: 10 }, 6000), RangeError);
});

test('fret arrondi au demi-kilo supérieur', () => {
  // 2,1 kg → 2,5 kg × 9 000 FCFA/kg (prix d'exemple) = 22 500 FCFA.
  assert.equal(fret(2_100, montant(9_000, 'XOF')).valeur, 22_500);
  assert.equal(fret(2_000, montant(9_000, 'XOF')).valeur, 18_000);
});

test('formatage en FCFA', () => {
  assert.equal(formater(montant(125_000, 'XOF')), '125 000 FCFA');
  assert.equal(formater(montant(1_250, 'GHS')), '12,50 GHS');
});

// ─── Parrainage (D-023) ─────────────────────────────────────────────────────

const base = {
  parametres: PARRAINAGE_PAR_DEFAUT_XOF,
  inscriptionFilleul: new Date('2027-01-31T00:00:00Z'),
  parrainId: 'usr_parrain',
  filleulId: 'usr_filleul',
  dejaVerseCeMois: montant(0, 'XOF'),
};
const livree = (date: string, frais = 20_000) => ({
  etat: 'livree', fraisServicePayes: montant(frais, 'XOF'), dateLivraison: new Date(date),
});

test('récompense de 5 % des frais de service sur une commande livrée', () => {
  const r = calculerRecompense({ ...base, commande: livree('2027-03-10T00:00:00Z') });
  assert.deepEqual(r, { statut: 'versee', montant: { valeur: 1_000, devise: 'XOF' } });
});

test('aucune récompense avant livraison, après 12 mois ou en auto-parrainage', () => {
  const nonLivree = { etat: 'payee', fraisServicePayes: montant(20_000, 'XOF'), dateLivraison: null };
  assert.equal(calculerRecompense({ ...base, commande: nonLivree }).statut, 'aucune');
  assert.deepEqual(calculerRecompense({ ...base, commande: livree('2028-02-01T00:00:00Z') }),
    { statut: 'aucune', raison: 'hors_delai' });
  assert.deepEqual(calculerRecompense({ ...base, filleulId: 'usr_parrain', commande: livree('2027-03-10T00:00:00Z') }),
    { statut: 'aucune', raison: 'auto_parrainage' });
});

test('au-delà du plafond mensuel, la récompense passe en revue', () => {
  const r = calculerRecompense({ ...base, dejaVerseCeMois: montant(49_500, 'XOF'), commande: livree('2027-03-10T00:00:00Z') });
  assert.equal(r.statut, 'en_revue');
});

test('ajout de mois calendaires en fin de mois', () => {
  assert.equal(ajouterMois(new Date('2027-01-31T00:00:00Z'), 1).toISOString().slice(0, 10), '2027-02-28');
  assert.equal(ajouterMois(new Date('2027-01-31T00:00:00Z'), 12).toISOString().slice(0, 10), '2028-01-31');
});

// ─── Options d'entrepôt (D-010, D-011) ──────────────────────────────────────

test('aucune prestation avancée n\'est commandable au MVP', () => {
  for (const option of Object.keys(OPTIONS_ENTREPOT)) {
    assert.throws(() => verifierOptionCommandable(option), OptionIndisponible);
  }
  assert.throws(() => verifierOptionCommandable('option_inventee'), OptionIndisponible);
  assert.equal(LIBELLE_INDISPONIBLE, 'Bientôt disponible');
});
