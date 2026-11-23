import { couleurs, espacements, rayons, roles, typographie } from '@ss-dropship/ui';
import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: roles.fondSecondaire },
  contenu: { padding: espacements.l, paddingBottom: 120, gap: espacements.l },
  titre: { fontSize: typographie.tailles.titre, fontWeight: '700', color: roles.texte },
  sousTitre: { fontSize: typographie.tailles.grand, fontWeight: '700', color: roles.texte },
  texte: { fontSize: typographie.tailles.normal, color: roles.texte },
  texteSecondaire: { fontSize: typographie.tailles.petit, color: roles.texteSecondaire },
  carte: {
    backgroundColor: couleurs.blanc,
    borderRadius: rayons.l,
    padding: espacements.l,
    gap: espacements.s,
    borderTopWidth: 4,
    borderTopColor: couleurs.bleu,
    shadowColor: couleurs.nuit,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espacements.m },
  icone: { width: 44, height: 44 },
  badgeBientot: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.surface,
    borderRadius: rayons.pilule,
    paddingHorizontal: espacements.m,
    paddingVertical: espacements.xs,
  },
  bouton: { backgroundColor: roles.action, borderRadius: rayons.m, padding: espacements.m, alignItems: 'center' },
  boutonTexte: { color: roles.texteSurAction, fontWeight: '700', fontSize: typographie.tailles.moyen },
  boutonDesactive: { opacity: 0.55 },
});
