# ADR-004 — Authentification, rôles et protection des données

**Date : 23/11/2026 · Statut : accepté · Phase 4.** Cahier des charges § 11 ; D-007, D-013.

## Décision

| Sujet | Règle |
|---|---|
| Mots de passe | Hachage Argon2id ; 8 caractères minimum ; vérification contre les mots de passe compromis courants |
| Sessions | Jeton d'accès court (15 min) ; jeton de rafraîchissement rotatif (30 jours), **stocké haché** (`Session.jetonHash`), révocable |
| Mobile | Jetons dans le stockage sécurisé du système (Keychain / Keystore) |
| Codes de vérification | 6 chiffres, hachés, 10 min, 5 tentatives puis blocage 15 min (US-AUT-02) |
| Administrateurs | Double authentification (TOTP) obligatoire pour tout rôle autre que `client` |
| Rôles (RBAC) | `client`, `agent_achat`, `agent_entrepot`, `logistique`, `support`, `comptable`, `admin` ; contrôle sur chaque route ; refus journalisé |
| Séparation des tâches | Remboursement Mobile Money : deux personnes habilitées (US-WAL-08) ; un agent ne valide pas sa propre correction comptable |
| Données internes | Coordonnées des fournisseurs et transitaires (`contactInterne`) jamais renvoyées au client (D-013) |
| Limites de débit | Par IP et par compte sur connexion, inscription, codes, création de paiement |
| Fichiers | Envoi direct vers le stockage par URL signée ; types et tailles contrôlés ; URL de lecture temporaires |
| Journaux | Aucun mot de passe, jeton, code ou numéro complet dans les journaux applicatifs |
| Audit | Toute action sensible → `JournalAudit` immuable (US-SOC-04) |
| Données personnelles | Export et suppression (anonymisation) sur demande, sauf écritures financières conservées (US-AUT-08) ; hébergement et transferts à valider par le juriste (M-007) |
| Parrainage | Anti-fraude : pas d'auto-parrainage, contrôle des téléphones et appareils en double, plafond mensuel en revue (D-023) |

## Conséquences
- Le sprint S1 livre l'authentification complète, rôles et MFA compris, avant toute donnée réelle.
- Un test d'intrusion (US-QUA-02) vérifie ces règles avant l'ouverture au Mali.
