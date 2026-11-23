import { traducteur } from '@ss-dropship/i18n';
import { couleurs, espacements, rayons } from '@ss-dropship/ui';
import { Image, Text, TextInput, View } from 'react-native';
import { Ecran } from '../../composants/Ecran';
import { ICONES } from '../../composants/icones';
import { s } from '../../composants/styles';

const t = traducteur('fr');
const MODES = [
  { cle: 'directe', icone: 'link' },
  { cle: 'recherche', icone: 'camera' },
  { cle: 'negociation', icone: 'deal' },
] as const;

export default function Accueil() {
  return (
    <Ecran>
      <Text style={s.titre}>{t('app.slogan')}</Text>
      <View
        style={[
          s.ligne,
          { backgroundColor: couleurs.blanc, borderRadius: rayons.pilule, paddingHorizontal: espacements.l },
        ]}
      >
        <Image source={ICONES.search} style={{ width: 28, height: 28 }} />
        <TextInput
          placeholder={t('accueil.recherche.placeholder')}
          accessibilityLabel={t('accueil.recherche.placeholder')}
          style={[s.texte, { flex: 1, paddingVertical: espacements.m }]}
        />
      </View>
      <Text style={s.sousTitre}>{t('accueil.modes.titre')}</Text>
      {MODES.map(({ cle, icone }) => (
        <View key={cle} style={s.carte}>
          <View style={s.ligne}>
            <Image source={ICONES[icone]} style={s.icone} />
            <Text style={s.sousTitre}>{t(`accueil.modes.${cle}`)}</Text>
          </View>
          <Text style={s.texteSecondaire}>{t(`accueil.modes.${cle}.detail`)}</Text>
        </View>
      ))}
    </Ecran>
  );
}
