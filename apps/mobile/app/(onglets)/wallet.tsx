import { traducteur } from '@ss-dropship/i18n';
import { Image, Pressable, Text, View } from 'react-native';
import { Ecran } from '../../composants/Ecran';
import { ICONES } from '../../composants/icones';
import { s } from '../../composants/styles';

const t = traducteur('fr');

/** Wallet (US-WAL-01) : solde calculé par l'API depuis le ledger, branché au sprint S6. Aucun solde inventé. */
export default function Wallet() {
  return (
    <Ecran>
      <View style={s.carte}>
        <Text style={s.texteSecondaire}>{t('wallet.solde')}</Text>
        <Text style={s.titre} accessibilityLabel="Solde non disponible">
          — FCFA
        </Text>
        <Text style={s.texteSecondaire}>{t('wallet.recompenses')} : — FCFA</Text>
      </View>
      <Pressable style={[s.bouton, s.boutonDesactive]} disabled accessibilityRole="button">
        <View style={s.ligne}>
          <Image source={ICONES.recharge} style={{ width: 28, height: 28 }} />
          <Text style={s.boutonTexte}>{t('wallet.recharger')}</Text>
        </View>
      </Pressable>
      <Text style={s.texteSecondaire}>
        Recharge par Orange Money ou Moov Money au Mali, disponible après contrat avec un prestataire (sprint S6). Votre
        solde n’est crédité qu’après confirmation du paiement.
      </Text>
    </Ecran>
  );
}
