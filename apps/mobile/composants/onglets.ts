// Les 5 onglets du cahier des charges (§ 4, M-005 option A) et leurs icônes Bogolan (D-018).
import type { CleTraduction } from '@ss-dropship/i18n';

export interface Onglet {
  readonly route: 'index' | 'commandes' | 'entrepot' | 'wallet' | 'compte';
  readonly cle: CleTraduction;
  readonly icone: 'home' | 'cart' | 'warehouse' | 'wallet' | 'user';
}

export const ONGLETS: readonly Onglet[] = [
  { route: 'index', cle: 'onglets.accueil', icone: 'home' },
  { route: 'commandes', cle: 'onglets.commandes', icone: 'cart' },
  { route: 'entrepot', cle: 'onglets.entrepot', icone: 'warehouse' },
  { route: 'wallet', cle: 'onglets.wallet', icone: 'wallet' },
  { route: 'compte', cle: 'onglets.compte', icone: 'user' },
];
