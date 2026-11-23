# ADR-003 — Prestataires externes derrière des interfaces

**Date : 23/11/2026 · Statut : accepté · Phase 4.** Consigne AGENTS n° 9 et n° 10 ; D-019, D-021, M-004.

## Contexte
Les prestataires de paiement, de transport et de messagerie diffèrent par pays et évoluent (Stripe absent en direct en
Afrique de l'Ouest, agrégateur à confirmer au Mali, transporteurs sans API). Le cœur métier ne doit pas en dépendre.

## Décision
Trois interfaces dans `packages/types/src/prestataires.ts` :

| Interface | Méthodes | Premier usage |
|---|---|---|
| `PaymentProvider` | `moyensDisponibles`, `creerPaiement`, `verifierWebhook`, `consulterStatut`, `rembourser` | Mobile Money au Mali (S6) |
| `CarrierProvider` | `coter`, `suivre` | Grilles Admin au MVP ; API seulement si contrat (US-TRA-07) |
| `NotificationProvider` | `envoyer` (clé d'idempotence) | SMS de vérification (S1), push et email (S9) |

Règles :
1. **Une implémentation sandbox** porte un `code` commençant par `sandbox_` et `estSandbox = true`. L'API refuse de
   démarrer en production si un prestataire actif est en sandbox.
2. **Activation d'un prestataire réel** : seulement si les quatre preuves sont réunies et notées dans
   `docs/integrations/PAIEMENTS_ET_LOGISTIQUE.md` : contrat signé ; tests sandbox réussis (succès, échec, webhook rejoué,
   signature invalide) ; validation du responsable paiements ; entrée au registre des décisions.
3. Les **secrets** (clés API, secrets de signature) sont dans le gestionnaire de secrets de l'hébergeur, jamais dans Git ni dans
   la base ; seul `.env.example` (sans valeur) est commité.
4. Les moyens proposés au client viennent de `Pays.moyensPaiement` ET de `moyensDisponibles` : un moyen non contracté n'apparaît pas.
5. Chaque appel sortant est journalisé (sans donnée sensible), avec délai d'attente et nouvelles tentatives bornées.

## État réel au 23/11/2026
Aucun prestataire n'est contracté ni intégré. Pistes documentées dans `ARBITRAGES_PHASE1.md` : agrégateur couvrant Orange
Money et Moov Money au Mali (CinetPay à confirmer, ou Orange Money Web Payment en direct), puis CinetPay / Paystack pour les
pays suivants. L'impact sur D-019 (Stripe) reste à arbitrer.
