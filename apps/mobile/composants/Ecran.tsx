import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { ChatFlottant } from './ChatFlottant';
import { s } from './styles';

export function Ecran({ children }: { children: ReactNode }) {
  return (
    <View style={s.ecran}>
      <ScrollView contentContainerStyle={s.contenu}>{children}</ScrollView>
      <ChatFlottant />
    </View>
  );
}
