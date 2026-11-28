# Journal des modifications — SS DROPSHIP

## 2026-11-28 — Sprint S2 : noyau de règles catalogue
- Ajout de contrats/types partagés et règles déterministes pour la visibilité, les catégories non vides, la recherche insensible aux accents, les filtres XOF, les liens produit autorisés et les favoris.
- Un produit n'est visible côté client que s'il est publié, dans une catégorie active et associé à un fournisseur validé.
- Les produits sans prix indicatif sont exclus d'un filtre prix; aucune valeur tarifaire n'est inventée. Le libellé « Prix indicatif, confirmé par devis » est fourni.
- Liens directs limités à HTTPS sur Alibaba, 1688 et Trendyol; aucun appel réseau.
- Tests ciblés ajoutés. Ce changement ne livre pas encore le CRUD Admin, les endpoints API, les modèles Prisma ni la persistance synchronisée des favoris.

