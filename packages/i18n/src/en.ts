// English (US-COM-05). A missing key falls back to French, never to the raw key.
import type { CleTraduction } from './fr.ts';

export const en: Partial<Record<CleTraduction, string>> = {
  'app.nom': 'SS DROPSHIP',
  'app.slogan': 'Buy in China, Turkey, Dubai and Europe. Receive in Mali.',

  'onglets.accueil': 'Home',
  'onglets.commandes': 'Orders',
  'onglets.entrepot': 'Warehouse',
  'onglets.wallet': 'Wallet',
  'onglets.compte': 'Account',
  'chat.ouvrir': 'Chat with support',

  'accueil.recherche.placeholder': 'Product name or link (Alibaba, 1688, Trendyol…)',
  'accueil.modes.titre': 'How would you like to order?',
  'accueil.modes.directe': 'Direct order',
  'accueil.modes.directe.detail': 'You have the product link or reference.',
  'accueil.modes.recherche': 'Product search',
  'accueil.modes.recherche.detail': 'Describe or photograph what you are looking for.',
  'accueil.modes.negociation': 'Search with negotiation',
  'accueil.modes.negociation.detail': 'An agent negotiates the best price for you.',

  'auth.inscription.titre': 'Create an account',
  'auth.champ.nom': 'Full name',
  'auth.champ.telephone': 'Phone',
  'auth.champ.email': 'Email',
  'auth.champ.pays': 'Country',
  'auth.champ.motDePasse': 'Password',
  'auth.champ.confirmation': 'Confirm password',
  'auth.champ.codeParrainage': 'Referral code (optional)',
  'auth.cgu': 'I accept the terms of service and the privacy policy',
  'auth.bouton.inscription': 'Create my account',
  'auth.connexion.titre': 'Sign in',
  'auth.bouton.connexion': 'Sign in',
  'auth.motDePasseOublie': 'Forgot your password?',
  'auth.parrainage.invalide': 'This referral code is invalid. You can sign up without a code.',

  'compte.parrainage': 'Referral',
  'compte.parrainage.monCode': 'My referral code',
  'compte.parrainage.copier': 'Copy',
  'compte.parrainage.partager': 'Share my link',
  'compte.parrainage.regle': 'Earn {taux} of the service fees on your referrals’ delivered orders for {duree} months.',

  'options.bientot': 'Coming soon',

  'wallet.solde': 'Balance',
  'wallet.recompenses': 'Rewards',
  'wallet.recharger': 'Top up',
  'wallet.confirmationEnCours': 'Payment being confirmed',

  'commande.etat.devis_demande': 'Quote requested',
  'commande.etat.devis_propose': 'Quote received',
  'commande.etat.payee': 'Paid',
  'commande.etat.en_transit': 'In transit',
  'commande.etat.livree': 'Delivered',
  'commande.etat.annulee': 'Cancelled',

  'erreur.generique': 'Something went wrong. Please try again in a moment.',
  'erreur.reseau': 'Unable to connect. Check your network.',
};
