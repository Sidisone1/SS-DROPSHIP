import { variablesCss } from '@ss-dropship/ui';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'SS DROPSHIP',
  description: 'Agent d’achat international : Chine, Turquie, Dubaï, Europe. Livraison au Mali.',
};

export const viewport: Viewport = { themeColor: '#10213D', width: 'device-width', initialScale: 1 };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Variables CSS issues des design tokens partagés (packages/ui). */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: contenu statique généré par nos tokens. */}
        <style dangerouslySetInnerHTML={{ __html: variablesCss() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
