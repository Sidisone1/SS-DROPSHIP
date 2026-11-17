# Architecture cible de SS DROPSHIP

> **Architecture proposée**, non preuve d'une application déjà développée.

## Monorepo
- apps/web : interface site client (responsive).
- apps/mobile : application mobile client.
- apps/admin : back-office administratif.
- packages/ui : composants visuels communs.
- packages/types : contrats de données.
- packages/config : configurations partagées.
- packages/utils : utilitaires.
- services/api : API métier centrale.
- services/workers : tâches asynchrones (notifications, paiements, suivi).
- design/branding : identité graphique et couleurs.
- design/wireframes : structures d'écrans.
- design/mockups : inventaire, exports HD par étape.
- design/icons : icônes 3D originales et leurs licences.
- design/prototypes : démonstrations interactives.
- docs/requirements : cahier des charges et règles métier.
- docs/architecture : diagrammes, API, data model.
- docs/decisions : registre des décisions.
- docs/planning : jalons et priorités.
- docs/integrations : fiches paiements/transitaires.

## Flux métier
1. Client : identité, compte, préférences, parrainage.
2. Sourcing : demandes, fournisseurs, offres, négociation.
3. Achat : panier, commande, facture, paiement.
4. Entrepôt : enregistrement du colis, affectation client, état, poids/volume.
5. Logistique : devis transport, choix transitaire, manifeste, suivi et livraison.
6. Service client : messages, notifications, litiges.
7. Administration : habilitations, taux, marges, modération, comptes, rapports.

## Données métier minimales
users, roles, referral_codes, referrals, suppliers, products, product_requests, quotes, carts, orders, order_lines, payment_attempts, wallet_accounts, ledger_entries, warehouse_packages, package_photos, shipments, tracking_events, freight_partners, addresses, notifications, tickets, audit_logs, admin_settings.

Toutes les entités métier et opérations doivent avoir un ID opaque stable et une piste de traçabilité. Les mouvements financiers sont immuables dans le journal comptable. Les devises et taux sont historisés par transaction.

## Architecture d'intégration
API HTTPS authentifiée; contrôles RBAC; adaptateurs isolés par prestataire; webhooks avec signature, journalisation et idempotence. Stockage chiffré pour médias/documents et URL temporaires. Files de traitement pour les notifications et événements logistiques. Aucun secret API dans le dépôt GitHub.

## Environnements
Développement, test/staging et production séparés; CI/CD; tests automatisés; surveillance; sauvegarde et restauration vérifiées. À établir avant une mise en service publique.

## Principe MVP
Les écrans et composants pourront anticiper des fonctions premium futures, **mais ne doivent pas permettre** de commander une inspection interne, un regroupement ou un reconditionnement tant que ces opérations ne sont pas réellement disponibles.
