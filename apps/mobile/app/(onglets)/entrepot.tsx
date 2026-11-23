import { traduire } from '@ss-dropship/i18n';
import { OPTIONS_ENTREPOT } from '@ss-dropship/types';
import { Image, Text, View } from 'react-native';
import { Ecran } from '../../composants/Ecran';
import { ICONES } from '../../composants/icones';
import { s } from '../../composants/styles';

/** Entrepôt (US-ENT-04, US-ENT-05) : carton expédié fermé ; prestations V2 affichées mais non commandables. */
export default function Entrepot() {
  return (
    <Ecran>
      <View style={s.carte}>
        <Text style={s.sousTitre}>Vos colis</Text>
        <Text style={s.texteSecondaire}>
          Votre carton d’origine est expédié sans être ouvert. Photos de l’emballage extérieur, poids et dimensions
          seront visibles ici à la réception.
        </Text>
      </View>
      <Text style={s.sousTitre}>Services</Text>
      {Object.entries(OPTIONS_ENTREPOT).map(([code, option]) => (
        <View key={code} style={[s.carte, s.ligne, s.boutonDesactive]} accessibilityState={{ disabled: true }}>
          <Image source={ICONES.bientot} style={s.icone} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.texte}>{option.libelle}</Text>
            <View style={s.badgeBientot}>
              <Text style={s.texteSecondaire}>{traduire('options.bientot')}</Text>
            </View>
          </View>
        </View>
      ))}
    </Ecran>
  );
}
