# ADR-002 — Wallet, ledger en partie double et webhooks de paiement

**Date : 23/11/2026 · Statut : accepté · Phase 4.** Décisions liées : D-008, D-022, D-023, D-025 (H-01, H-02, H-05).

## Contexte
L'argent des clients transite par SS DROPSHIP. Le cahier des charges (§ 9) exige une confirmation par le prestataire avant
tout crédit, l'idempotence, des remboursements traçables et un rapprochement quotidien. Toute erreur ici coûte de l'argent
réel ou la confiance des clients.

## Décision

### 1. Ledger en partie double, en écriture seule
- Chaque mouvement est une `TransactionLedger` composée d'`EcritureLedger` dont la **somme est nulle par devise**.
- Les soldes ne sont **jamais stockés** : solde d'un compte = somme de ses écritures.
- Comptes client : `client_principal` et `client_recompenses` (non retirable, utilisable sur les frais de service, H-05).
  Comptes système : `systeme_prestataire` (un par prestataire et pays), `systeme_revenus_frais`,
  `systeme_fournisseurs_a_payer`, `systeme_transport_a_payer`, `systeme_charge_parrainage`.
- Une correction se fait par une transaction inverse, jamais par modification.
- **Protections en base** (migration `20261123000100_protections`, testées sur PostgreSQL) : UPDATE et DELETE interdits sur
  le ledger, le journal d'audit et les historiques ; transaction déséquilibrée refusée au COMMIT ; solde client négatif
  refusé ; devise d'écriture = devise du compte ; clé d'idempotence unique.

### 2. Écritures types (montants d'exemple en FCFA)
| Opération | Débit | Crédit |
|---|---|---|
| Recharge confirmée de 50 000 | `systeme_prestataire` −50 000 | `client_principal` +50 000 |
| Paiement d'une commande (produit 100 000, frais 8 000, transport 5 000) | `client_principal` −113 000 | `fournisseurs_a_payer` +105 000 ; `revenus_frais` +8 000 |
| Paiement des frais avec les récompenses (H-05) | `client_recompenses` −1 000 | `revenus_frais` +1 000 |
| Paiement du fret (H-02) | `client_principal` −22 500 | `transport_a_payer` +22 500 |
| Annulation avant achat | inverse de la transaction de paiement, type `remboursement` | |
| Récompense de parrainage (5 % de 8 000) | `charge_parrainage` −400 | `client_recompenses` (parrain) +400 |

### 3. Traitement d'un webhook (seule source de crédit)
```text
1. Recevoir le corps BRUT ; enregistrer EvenementWebhook (même invalide) → réponse 200 rapide.
2. PaymentProvider.verifierWebhook : signature, horodatage (fenêtre ≤ 5 min), format. Invalide → raisonRejet, fin.
3. Dans UNE transaction SQL :
   a. Verrouiller la TentativePaiement (SELECT … FOR UPDATE).
   b. Si (prestataire, evenementId) déjà traité → fin (idempotence).
   c. Vérifier montant ET devise reçus = attendus ; sinon tentative → « anomalie », alerte comptable, fin.
   d. Vérifier la transition (packages/types : transitionner('paiement', …)) ; une tentative expirée passe en anomalie.
   e. Statut succès → tentative « confirmee » + TransactionLedger(cleIdempotence = "webhook:<prestataire>:<evenementId>").
4. COMMIT → les contrôles différés vérifient l'équilibre. Puis notification « recharge confirmée » (file BullMQ).
```
Le retour du client sur l'application (`urlRetour`) n'est **jamais** une preuve de paiement : l'écran affiche
« Paiement en cours de confirmation » et interroge `GET /wallet/recharges/{id}`.

### 4. Webhook manquant et rapprochement
- Un worker interroge `consulterStatut` pour les tentatives en attente depuis plus de 10 minutes ; un succès ainsi constaté
  suit le même chemin que l'étape 3 (clé d'idempotence `poll:<prestataire>:<reference>`), avec une seconde vérification.
- Rapprochement quotidien (US-WAL-06) : relevé du prestataire comparé aux transactions `recharge` ; chaque écart est listé
  et alerte le comptable. Objectif : zéro écart non expliqué.

### 5. Idempotence côté client
Toute requête qui crée ou débite exige `Idempotency-Key` ; la réponse est mise en cache 24 h par (utilisateur, clé).
Un double appui sur « Payer » produit un seul débit.

## Conséquences
- Impossible de « créditer à la main » un wallet : une correction exige une transaction équilibrée, auditée, avec rôle comptable.
- Les soldes se recalculent à tout moment depuis l'historique (audit, litiges).
- Coût : requêtes d'agrégation sur les écritures ; index `(compteId, creeLe)` prévu, instantanés de solde possibles plus tard
  (sans jamais remplacer le ledger comme source de vérité).
