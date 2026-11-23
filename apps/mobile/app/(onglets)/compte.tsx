import { traducteur } from '@ss-dropship/i18n';
import { PARRAINAGE_PAR_DEFAUT_XOF } from '@ss-dropship/types';
import { Image, Text, View } from 'react-native';
import { Ecran } from '../../composants/Ecran';
import { ICONES } from '../../composants/icones';
import { s } from '../../composants/styles';

const t = traducteur('fr');

/** Compte : l'accès au programme de parrainage reste visible une fois connecté (D-005, US-AUT-06). */
export default function Compte() {
  const { tauxPb, dureeMois } = PARRAINAGE_PAR_DEFAUT_XOF;
  return (
    <Ecran>
      <View style={s.carte}>
        <View style={s.ligne}>
          <Image source={ICONES.gift} style={s.icone} />
          <Text style={s.sousTitre}>{t('compte.parrainage')}</Text>
        </View>
        <Text style={s.texte}>
          {t('compte.parrainage.regle', { taux: `${tauxPb / 100}\u00a0%`, duree: String(dureeMois) })}
        </Text>
        <Text style={s.texteSecondaire}>
          {t('compte.parrainage.monCode')} : disponible après connexion (sprint S1).
        </Text>
      </View>
      <View style={s.carte}>
        <Text style={s.sousTitre}>Mon compte</Text>
        <Text style={s.texteSecondaire}>Profil, adresses, notifications, sécurité, factures et support.</Text>
      </View>
    </Ecran>
  );
}
