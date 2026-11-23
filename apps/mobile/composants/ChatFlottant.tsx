import { traduire } from '@ss-dropship/i18n';
import { couleurs } from '@ss-dropship/ui';
import { Image, Pressable, StyleSheet } from 'react-native';
import { ICONES } from './icones';

/** Bouton de discussion accessible depuis tous les onglets (cahier des charges § 4). Branché au support en S9. */
export function ChatFlottant() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={traduire('chat.ouvrir')} style={styles.bouton}>
      <Image source={ICONES.chat} style={styles.icone} accessibilityIgnoresInvertColors />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: couleurs.nuit,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  icone: { width: 36, height: 36 },
});
