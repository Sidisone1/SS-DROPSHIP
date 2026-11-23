import { variablesCss } from '@ss-dropship/ui';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './admin.css';

export const metadata: Metadata = { title: 'Back-office SS DROPSHIP', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: contenu statique généré par nos tokens. */}
        <style dangerouslySetInnerHTML={{ __html: variablesCss() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
