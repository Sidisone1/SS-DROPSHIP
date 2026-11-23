// Démarre un vrai PostgreSQL embarqué (PGlite) exposé sur un port local, avec toutes les migrations appliquées.
import { readdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

async function portLibre(): Promise<number> {
  return new Promise((resoudre) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const port = (s.address() as { port: number }).port;
      s.close(() => resoudre(port));
    });
  });
}

export async function demarrerBase(): Promise<{ url: string; db: PGlite; arreter: () => Promise<void> }> {
  const db = await PGlite.create();
  const dossier = fileURLToPath(new URL('../prisma/migrations/', import.meta.url));
  for (const nom of readdirSync(dossier)
    .filter((n) => /^\d+_/.test(n))
    .sort()) {
    await db.exec(readFileSync(`${dossier}${nom}/migration.sql`, 'utf8'));
  }
  const port = await portLibre();
  const serveur = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });
  await serveur.start();
  return {
    url: `postgresql://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`,
    db,
    arreter: async () => {
      await serveur.stop();
      await db.close();
    },
  };
}
