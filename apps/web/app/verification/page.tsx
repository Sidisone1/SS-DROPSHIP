import { traducteur } from '@ss-dropship/i18n';
import { redirect } from 'next/navigation';
import { EnTete } from '../../composants/EnTete';
import { Formulaire } from '../../composants/Formulaire';
import { verifier } from '../actions';

/** Vérification du contact (US-AUT-02). */
export default async function Verification({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; canal?: string; avertissement?: string }>;
}) {
  const t = traducteur('fr');
  const { u, canal, avertissement } = await searchParams;
  if (!u) redirect('/inscription');
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur etroit">
        <h1>{t('auth.verification.titre')}</h1>
        {avertissement ? <p className="alerte">{t('auth.parrainage.invalide')}</p> : null}
        <p>{t(canal === 'email' ? 'auth.verification.texte.email' : 'auth.verification.texte.sms')}</p>
        <Formulaire
          action={verifier}
          bouton={t('auth.verification.bouton')}
          secondaire={{ nom: 'action', valeur: 'renvoyer', libelle: t('auth.verification.renvoyer') }}
        >
          <input type="hidden" name="utilisateurId" value={u} />
          <label>
            {t('auth.champ.code')}
            <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} />
          </label>
        </Formulaire>
      </main>
    </>
  );
}
