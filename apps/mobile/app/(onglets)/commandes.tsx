import { Image, Text, View } from 'react-native';
import { Ecran } from '../../composants/Ecran';
import { ICONES } from '../../composants/icones';
import { s } from '../../composants/styles';

/** Liste des commandes (US-CMD-03) : branchée sur l'API au sprint S5. Aucune donnée fictive affichée. */
export default function Commandes() {
  return (
    <Ecran>
      <View style={[s.carte, { alignItems: 'center' }]}>
        <Image source={ICONES.box} style={{ width: 64, height: 64 }} />
        <Text style={s.sousTitre}>Aucune commande pour le moment</Text>
        <Text style={s.texteSecondaire}>Vos demandes, devis et commandes apparaîtront ici.</Text>
      </View>
    </Ecran>
  );
}
