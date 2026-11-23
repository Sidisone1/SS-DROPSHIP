# Contrats partagés — `@ss-dropship/types`

Écrits une fois, utilisés par le site, l'application mobile, le back-office et l'API (ADR-001). Aucune dépendance.

| Fichier | Contenu |
|---|---|
| `src/etats.ts` | Machines à états commande, paiement, colis ; `transitionner` refuse tout passage non prévu |
| `src/montants.ts` | Montants entiers par devise, taux en points de base, frais de service, conversion, poids taxable, fret, formatage FCFA |
| `src/parrainage.ts` | Récompense de parrainage (D-023) : livraison, durée de 12 mois, auto-parrainage, plafond mensuel |
| `src/options.ts` | Prestations d'entrepôt V2, toutes non commandables au MVP (D-010, D-011) |
| `src/prestataires.ts` | Interfaces `PaymentProvider`, `CarrierProvider`, `NotificationProvider` (ADR-003) |

Tests (Node ≥ 22.18, sans installation) : `node --test "packages/types/src/**/*.test.ts"`.
`coherence.test.ts` vérifie que les états sont identiques ici, dans `schema.prisma` et dans `openapi.yaml`.
Vérification des types : `tsc -p packages/types` (TypeScript et `@types/node` installés au sprint S0).

Statut : livré en phase 4 (23/11/2026). Les valeurs d'exemple (taux, plafond) seront remplacées par les paramètres Admin (M-003).
