// Adapté de Toolkit/suppliers-market/src/components/ProgressSteps.jsx.
document.querySelectorAll('[data-tk-suivi]').forEach((suivi) => {
  const etapes = Array.from(suivi.nextElementSibling.querySelectorAll('li'));
  const actuelle = etapes.findIndex((etape) => etape.getAttribute('aria-current') === 'step');
  if (actuelle < 0 || etapes.length < 2) return;

  const etat = suivi.querySelector('.tk-suivi-etat');
  const rail = suivi.querySelector('.tk-suivi-rail span');
  const precedente = suivi.querySelector('[data-tk-prev]');
  const suivante = suivi.querySelector('[data-tk-next]');
  const retour = suivi.querySelector('[data-tk-reset]');
  let index = actuelle;

  function afficher() {
    const titre = etapes[index].querySelector('b').textContent;
    const mode = index === actuelle ? 'Statut actuel (démo)' : 'Aperçu de l’étape';
    etat.textContent = `${mode} · ${index + 1}/${etapes.length} · ${titre}`;
    rail.style.width = `${100 * index / (etapes.length - 1)}%`;
    etapes.forEach((etape, i) => etape.classList.toggle('tk-suivi-apercu', i === index && i !== actuelle));
    precedente.setAttribute('aria-disabled', String(index === 0));
    suivante.setAttribute('aria-disabled', String(index === etapes.length - 1));
    retour.setAttribute('aria-disabled', String(index === actuelle));
  }

  precedente.addEventListener('click', () => {
    if (index > 0) { index -= 1; afficher(); }
  });
  suivante.addEventListener('click', () => {
    if (index < etapes.length - 1) { index += 1; afficher(); }
  });
  retour.addEventListener('click', () => {
    if (index !== actuelle) { index = actuelle; afficher(); }
  });
  afficher();
});
