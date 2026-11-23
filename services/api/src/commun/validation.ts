import type { z } from 'zod';
import { invalide } from './erreurs.js';

/** Valide un corps de requête ; renvoie une erreur 422 listant les champs en cause. */
export function valider<T extends z.ZodType>(schema: T, donnees: unknown): z.infer<T> {
  const resultat = schema.safeParse(donnees);
  if (!resultat.success) {
    const champs = Object.fromEntries(resultat.error.issues.map((i) => [i.path.join('.') || '_', i.message]));
    throw invalide('Certaines informations sont invalides.', { champs });
  }
  return resultat.data;
}
