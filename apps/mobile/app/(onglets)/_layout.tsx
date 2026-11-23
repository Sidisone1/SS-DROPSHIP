import { traduire } from '@ss-dropship/i18n';
import { couleurs, roles } from '@ss-dropship/ui';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { ICONES } from '../../composants/icones';
import { ONGLETS } from '../../composants/onglets';

export default function Onglets() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: roles.enTete, borderBottomWidth: 4, borderBottomColor: couleurs.brunBogolan },
        headerTintColor: roles.texteSurEnTete,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: couleurs.bleu,
        tabBarInactiveTintColor: roles.texteSecondaire,
      }}
    >
      {ONGLETS.map((o) => (
        <Tabs.Screen
          key={o.route}
          name={o.route}
          options={{
            title: o.route === 'index' ? traduire('app.nom') : traduire(o.cle),
            tabBarLabel: traduire(o.cle),
            tabBarIcon: ({ focused }) => (
              <Image source={ICONES[o.icone]} style={{ width: 28, height: 28, opacity: focused ? 1 : 0.6 }} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
