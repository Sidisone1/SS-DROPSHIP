import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliserTelephoneMali, validerInscription, type SaisieInscription } from './inscription.ts';

const valide: SaisieInscription = {
  nom: 'Aminata Traoré',
  pays: 'ML',
  telephone: '76 12 34 56',
  email: ' AMINATA@example.com ',
  motDePasse: 'longSecret2026',
  motDePasseConfirmation: 'longSecret2026',
  codeParrainage: ' amina7k ',
  cguAcceptees: true,
};

test('US-AUT-01 : normalise le téléphone au format E.164', () => {
  assert.equal(normaliserTelephoneMali('76 12 34 56'), '+22376123456');
  assert.equal(normaliserTelephoneMali('+223 76 12 34 56'), '+22376123456');
  assert.equal(normaliserTelephoneMali('00223 76 12 34 56'), '+22376123456');
  assert.equal(normaliserTelephoneMali('123'), null);
  assert.equal(normaliserTelephoneMali('+225 01234567'), null);
});

test('US-AUT-01 : normalise les champs et ne retourne aucun secret', () => {
  const resultat = validerInscription(valide);
  assert.deepEqual(resultat, {
    valide: true,
    champs: {
      nom: 'Aminata Traoré', pays: 'ML',
      telephone: '+22376123456',
      email: 'aminata@example.com',
      codeParrainage: 'AMINA7K',
    },
  });
  assert.ok(!JSON.stringify(resultat).includes('longSecret2026'));
});

test('US-AUT-01 : le code de parrainage et le contact email sont facultatifs', () => {
  const resultat = validerInscription({ ...valide, email: '', codeParrainage: '' });
  assert.equal(resultat.valide, true);
  if (resultat.valide) {
    assert.equal(resultat.champs.email, null);
    assert.equal(resultat.champs.codeParrainage, null);
  }
});

test('US-AUT-01 : téléphone ou e-mail est obligatoire', () => {
  const resultat = validerInscription({ ...valide, telephone: '', email: '' });
  assert.equal(resultat.valide, false);
  if (!resultat.valide) assert.ok(resultat.erreurs.contact);
});

test('US-AUT-01 : refuse téléphone et e-mail malformés', () => {
  const resultat = validerInscription({ ...valide, telephone: '12345', email: 'adresse-invalide' });
  assert.equal(resultat.valide, false);
  if (!resultat.valide) {
    assert.ok(resultat.erreurs.telephone);
    assert.ok(resultat.erreurs.email);
  }
});

test('US-AUT-01 : interdit un autre pays avant son ouverture', () => {
  const resultat = validerInscription({ ...valide, pays: 'GH' });
  assert.equal(resultat.valide, false);
  if (!resultat.valide) assert.ok(resultat.erreurs.pays);
});

test('US-AUT-01 : rejette les mots de passe trop courts ou divergents', () => {
  const resultat = validerInscription({ ...valide, motDePasse: 'abc', motDePasseConfirmation: 'def' });
  assert.equal(resultat.valide, false);
  if (!resultat.valide) {
    assert.ok(resultat.erreurs.motDePasse);
    assert.ok(resultat.erreurs.motDePasseConfirmation);
  }
});

test('US-AUT-01 : refuse les codes malformés et CGU non acceptées', () => {
  const resultat = validerInscription({ ...valide, codeParrainage: 'CODE-INVALIDE', cguAcceptees: false });
  assert.equal(resultat.valide, false);
  if (!resultat.valide) {
    assert.ok(resultat.erreurs.codeParrainage);
    assert.ok(resultat.erreurs.cguAcceptees);
  }
});

test('US-AUT-01 : refuse un nom vide et accepte une inscription avec e-mail seul', () => {
  const mauvais = validerInscription({ ...valide, nom: ' ', telephone: '' });
  assert.equal(mauvais.valide, false);
  const emailSeul = validerInscription({ ...valide, telephone: '' });
  assert.equal(emailSeul.valide, true);
});
