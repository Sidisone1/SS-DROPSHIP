# Intégrations prévues — non connectées à ce stade

## Paiements
### Carte et wallets internationaux
Visa/Mastercard, Stripe, PayPal, Apple Pay, Google Pay.

### Wallets régionaux et internationaux
Ligdicash, MoneyFusion, Mobile Money (selon pays), Alipay, WeChat Pay, virement bancaire; USDT sur TRON seulement si autorisé par les règles applicables et le prestataire.

**Impératifs techniques** :
1. Créer une intention de recharge avec ID unique, montant, devise et frais annoncés.
2. Rediriger vers le prestataire officiellement intégré et autorisé.
3. Vérifier la **confirmation serveur du paiement** (signature webhook, statut final, montant/devise, idempotence).
4. Inscrire une seule écriture au ledger, puis créditer le wallet.
5. Gérer rejets, remboursements, change, écarts, litiges et rapprochement.
6. Disponibilité des prestataires par pays configurable par Admin.
7. Ne pas stocker de clés API en clair, ni exposer les données de carte.

## Transporteurs et entrepôts
- Options : transitaire personnel du client, partenaire SS DROPSHIP, DHL, FedEx, UPS, Aramex selon disponibilité réelle.
- Répertoire complet des transitaires : **Admin uniquement**.
- Aire d'opérations : Chine/Turquie/Dubaï/Europe vers les pays de destination.
- Suivi : numéro transporteur + événements enregistrés + notifications SMS, WhatsApp, email selon préférences et canaux autorisés.
- Transport maritime LCL/FCL : hors MVP, phase ultérieure.
- AnKaTa : partenaire potentiel pour livraison locale; connexion API **reportée**.

## Réserves
L'affichage des logos des prestataires dans une maquette ne constitue pas une autorisation commerciale, un contrat ou une connexion opérationnelle. Documenter tarifs, accords, exigences de conformité, environnements sandbox et preuves de test avant mise en production.
