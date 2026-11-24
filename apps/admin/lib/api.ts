// Appels serveur vers l'API SS DROPSHIP. Utilisé uniquement côté serveur (actions, composants serveur, routes).
export const URL_API = process.env.API_URL ?? 'http://localhost:3000/v1';

export interface ReponseApi<T = Record<string, unknown>> {
  ok: boolean;
  statut: number;
  donnees: T;
}

export interface ErreurApi {
  code?: string;
  message?: string;
  details?: { champs?: Record<string, string>; utilisateurId?: string; essaisRestants?: number };
}

export async function appelerApi<T = Record<string, unknown>>(
  chemin: string,
  options: { methode?: string; corps?: unknown; jeton?: string } = {},
): Promise<ReponseApi<T>> {
  try {
    const reponse = await fetch(`${URL_API}${chemin}`, {
      method: options.methode ?? (options.corps === undefined ? 'GET' : 'POST'),
      headers: {
        'content-type': 'application/json',
        ...(options.jeton ? { authorization: `Bearer ${options.jeton}` } : {}),
      },
      body: options.corps === undefined ? null : JSON.stringify(options.corps),
      cache: 'no-store',
    });
    const texte = await reponse.text();
    return { ok: reponse.ok, statut: reponse.status, donnees: (texte ? JSON.parse(texte) : {}) as T };
  } catch {
    return {
      ok: false,
      statut: 0,
      donnees: { code: 'reseau', message: 'Connexion impossible. Vérifiez votre réseau.' } as T,
    };
  }
}
