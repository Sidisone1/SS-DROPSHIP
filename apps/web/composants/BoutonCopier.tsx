'use client';

import { useState } from 'react';

export function BoutonCopier({ texte, libelle, copie }: { texte: string; libelle: string; copie: string }) {
  const [fait, setFait] = useState(false);
  return (
    <button
      type="button"
      className="bouton bouton-clair bordure"
      onClick={async () => {
        await navigator.clipboard?.writeText(texte);
        setFait(true);
      }}
    >
      {fait ? copie : libelle}
    </button>
  );
}
