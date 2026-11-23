# Intégration paiements multi-prestataires — cadrage (23/11/2026)

Projet : SS-DROPSHIP

## Besoin métier
commandes, wallet, achats internationaux

## Parcours envisagés
payin commandes et wallet, remboursements.

## Prestataires
- LigdiCash : payin redirect d'abord ; payin sans redirection ultérieurement ; payout marchand uniquement si nécessaire et éligible.
- SasPay : prestataire alternatif après validation des contrats API et de la disponibilité pays.

## Exigences communes
- Backend uniquement pour les secrets, contrôle des rôles et opérations sensibles.
- Référence interne unique, montants entiers FCFA, journal comptable équilibré, transaction atomique et idempotence.
- Confirmer à distance les transactions avant de modifier un solde ; les retours navigateur et callbacks ne sont pas des preuves suffisantes.
- Double webhook, échec, timeout, remboursement, fraude, réconciliation et audit.
- KYC, tarifs, opérateurs maliens, fiscalité, politiques de remboursement et conditions contractuelles à confirmer.
- Aucun paiement réel ni test sur des fonds réels sans autorisation.

## État réel
Ce fichier est un **cadrage ajouté sur branche de développement**, pas une intégration API terminée. Aucun code financier existant n'a été remplacé, aucune migration appliquée, aucun test exécuté, aucune transaction déclenchée. Examiner d'abord l'architecture du dépôt et les moyens de paiement existants, puis développer les adaptateurs et tests propres au projet.

Référence de travail : https://github.com/Sidisone1/Vupay/tree/feature/finance-v2-budget-20261123
Documentation LigdiCash : https://developers.ligdicash.com/llms.txt
