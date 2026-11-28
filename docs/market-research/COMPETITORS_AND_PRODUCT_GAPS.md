# Veille concurrentielle — plateformes d'achat international

**Vérifiée le 28 novembre 2026.** Les fonctionnalités ci-dessous sont issues des pages officielles lorsqu'elles étaient accessibles. Les affirmations marketing ne constituent pas une vérification indépendante de qualité, de disponibilité ou de couverture au Mali.

## Plateformes observées

| Plateforme | Fonctions publiquement annoncées | Éléments à retenir |
|---|---|---|
| [Sugargoo](https://blog.sugargoo.com/) | Achat par lien et recherche; sourcing; panier; QC photo et inspection vidéo en option; entrepôt annoncé gratuit 90 jours; regroupement, emballage personnalisé, protection fragile; calculateur; nombreuses routes internationales; support multilingue | Parcours d'achat de bout en bout, estimation fret, suivi et tarifs lisibles |
| [CSSBuy](https://www.cssbuy.com/shop/shipForMe) | Achat assisté ou réception de colis envoyés par le client; QC photo et aide au retour; stockage annoncé 90 jours; consolidation/séparation; emballage sous vide ou renforcé; estimation d'expédition, routes multiples; application mobile et notifications | Transfert de colis, retour vendeur, services d'emballage à la demande |
| [HooBuy](https://hoobuy.com/beginner-guide?stepKey=Custom1) | Lien Taobao/Tmall/1688; options et achat assisté; contact agent; contrôle et photos; stockage annoncé 90 jours; regroupement; routes selon destination; dépôt fret puis ajustement final; services d'emballage et assurance | Calcul du fret après poids/dimensions, restrictions par ligne, service après-vente |
| [Superbuy](https://www.superbuy.com/en/page/newguide/shoppingagent/) | Recherche et liens; sourcing expert; commande personnalisée; agent d'achat; QC; stockage annoncé 90 jours; calculateur, consolidation; forwarding/transit; assurance/indemnisation; aide au dédouanement | Recherche assistée, transparence des étapes et des risques transport |
| [OrientDig](https://orientdig.com/) | Agent d'achat, guides d'expédition, suivi des statuts, contrôle visuel, stockage annoncé 90 jours, prise en charge des retours avant départ selon conditions | États détaillés et aide après-vente |
| [AllChinaBuy](https://www.allchinabuy.com/en/) | Achat, inspection/photo, stockage annoncé 90 jours, calcul fret, service d'expédition expert avec choix de colis multiples et préférence coût/délai | Choix explicite entre coût, vitesse et compromis avant expédition |
| [Kakobuy](https://www.kakobuy.com/) | Plateforme récente mentionnée dans des annuaires comparatifs : sourcing de places de marché chinoises, entrepôt, inspection, regroupement et expédition | À surveiller; vérifier disponibilité et services depuis des sources officielles avant toute intégration |

### Nouveaux acteurs repérés

Les annuaires de veille publient aussi des acteurs récents tels que WheeBuy, ShipzoBuy, SpanBuy, Boonbuy, DgoBuy et OOTDBuy. Cette liste est un signal de veille, pas une confirmation de leur fiabilité ni de leur capacité à servir le Mali. Toute décision d'intégration doit vérifier l'entité, le support, les destinations, les restrictions, les prix réels, les conditions de remboursement et les preuves de livraison.

### Plateformes signalées comme indisponibles par une veille tierce

Une page de statut datée du 27 novembre 2026 signale Hoobuy, CNFans, AllChinaBuy et Mulebuy comme n'acceptant pas de nouvelles commandes au moment de sa vérification. Cette information n'est pas corroborée ici par leurs pages officielles et doit rester « à revérifier »; elle n'est pas traitée comme un statut permanent.

## Écart avec SS DROPSHIP

### Déjà prévu dans le cahier des charges ou le schéma
- Achat direct par lien, recherche agent et négociation multi-fournisseurs.
- Catalogue et favoris, fournisseurs validés, devis comparatifs.
- Paiement en deux temps, suivi des commandes, réception du carton fermé.
- Mesure du poids et dimensions, calcul fret, options de retrait ou livraison à Bamako.
- Interface de prestataires transporteurs, historique d'expédition, audit et back-office.
- Inscription, parrainage, portefeuille et paiement Mobile Money prévus; aucun prestataire de paiement n'est actuellement contracté.

### À compléter au MVP
1. Calculateur de fret avec pays/destination, catégorie de marchandise, poids et dimensions, mode/route réellement activée; afficher tarif horodaté ou « estimation à confirmer », jamais un faux prix.
2. Grille de restrictions et d'éligibilité par produit et route; avertissement avant paiement/expédition.
3. Historique transparent des écarts entre acompte fret et poids facturé, avec remboursement/reliquat selon une procédure comptable réelle.
4. Espace après-vente : signaler retard, colis abîmé/ouvert à réception, demande de retour avant consolidation/expédition, pièces justificatives, suivi de résolution.
5. Notifications d'étapes et alertes de stockage à partir de règles réellement approuvées, sans annoncer une durée gratuite avant validation du partenaire.
6. Ajout d'un mode « transfert de colis » (le client achète lui-même puis envoie à l'entrepôt) à arbitrer avant de le programmer : nécessite adresse d'entrepôt, identifiant d'affectation, déclaration, filtrage, responsabilités et procédure colis non identifié.
7. Transparence des frais : coût produit, transport local, frais de service, fret, manutention, droits/taxes et livraison locale séparés; chaque estimation doit porter sa source et sa date.

### V2 / après approbation opérationnelle
- Inspection interne, photos/vidéos du contenu, retours vendeur, regroupement/séparation, emballage sous vide/renforcé et assurance comme options explicites.
- Ces options restent désactivées au lancement selon D-010/D-011. La consigne carton d'origine fermé doit être réarbitrée avant activation.
- Recherche visuelle assistée et sourcing expert avec file agent.
- Expéditions multi-colis, règles de partage de coûts et comparaison des routes.
- Programme de fidélité / parrainage avancé uniquement après validation économique, antifraude et règlement.

## Ordre de réalisation proposé

| Priorité | Lot | Dépendances |
|---|---|---|
| P0 | Catalogue client fiable + gestion Admin + favoris synchronisés | Sprint S2, accès et journal d'audit |
| P0 | Demande d'achat et devis, avec frais transparents | S3–S4, paramètres Admin |
| P0 | Wallet et paiements réels sécurisés par webhook | S5–S6, contrat prestataire Mali |
| P0 | Entrepôt : réception extérieure carton fermé, pesée/dimensions et incidents | S7, partenaire opérationnel |
| P0 | Estimation fret à partir de grilles validées, expédition et suivi jusqu'à Bamako | S8, transporteur contracté |
| P1 | Retours, réclamations, notifications et aide avant/après achat | S3/S7/S9, politique commerciale |
| P2 | Transfert de colis, QC contenu, consolidation et emballage personnalisé | D-010/D-011 à arbitrer, procédures entrepôt |

## Sources consultées

- Sugargoo, page officielle: https://blog.sugargoo.com/
- CSSBuy, page services et forwarding: https://www.cssbuy.com/shop/shipForMe
- CSSBuy, parcours d'achat: https://m.cssbuy.com/buyforme
- HooBuy, guide officiel: https://hoobuy.com/beginner-guide?stepKey=Custom1
- HooBuy, estimation fret: https://hoobuy.com/estimation
- Superbuy, guide officiel: https://www.superbuy.com/en/page/newguide/shoppingagent/
- Superbuy, sourcing expert: https://www.superbuy.com/en/page/eptpurchase/
- OrientDig, aide: https://orientdig.com/help-center
- AllChinaBuy, page officielle: https://www.allchinabuy.com/en/
- Liste d'acteurs et statut à revérifier (source tierce): https://grails.fit/agent-status
- Annuaire comparatif (source tierce): https://www.uidbuyspreadsheet.com/agents/
