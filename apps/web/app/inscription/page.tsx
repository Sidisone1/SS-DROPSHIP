import { PAYS, PAYS_PAR_DEFAUT } from '@ss-dropship/config';
import { traducteur } from '@ss-dropship/i18n';
import Link from 'next/link';
import { EnTete } from '../../composants/EnTete';
import { Formulaire } from '../../composants/Formulaire';
import { inscrire } from '../actions';

/** Inscription (US-AUT-01) : le code de parrainage est facultatif et prérempli par le lien partagé (D-005). */
export default async function Inscription({ searchParams }: { searchParams: Promise<{ parrain?: string }> }) {
  const t = traducteur('fr');
  const { parrain } = await searchParams;
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur etroit">
        <h1>{t('auth.inscription.titre')}</h1>
        <Formulaire action={inscrire} bouton={t('auth.bouton.inscription')}>
          <label>
            {t('auth.champ.nom')}
            <input name="nom" autoComplete="name" required />
          </label>
          <label>
            {t('auth.champ.pays')}
            <select name="pays" defaultValue={PAYS_PAR_DEFAUT}>
              {PAYS.filter((p) => p.ouvert).map((p) => (
                <option key={p.code} value={p.code}>
                  {p.nom}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('auth.champ.telephone')}
            <input name="telephone" type="tel" autoComplete="tel" placeholder="+223 …" />
          </label>
          <label>
            {t('auth.champ.email')}
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            {t('auth.champ.motDePasse')}
            <input name="motDePasse" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <label>
            {t('auth.champ.confirmation')}
            <input name="motDePasseConfirmation" type="password" autoComplete="new-password" required />
          </label>
          <label>
            {t('auth.champ.codeParrainage')}
            <input name="codeParrainage" autoCapitalize="characters" defaultValue={parrain ?? ''} />
          </label>
          <label className="case">
            <input name="cguAcceptees" type="checkbox" required />
            {t('auth.cgu')}
          </label>
        </Formulaire>
        <p className="note centre">
          {t('auth.dejaUnCompte')} <Link href="/connexion">{t('auth.connexion.titre')}</Link>
        </p>
      </main>
    </>
  );
}
