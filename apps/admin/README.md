# Back-office SS DROPSHIP — `@ss-dropship/admin`

Next.js 16, réservé au personnel habilité (en-tête `X-Robots-Tag: noindex`).
- `/` : connexion avec champ de double authentification (activée en S1, ADR-004).
- `/tableau-de-bord` : modules par épopée et rôles habilités (`app/modules.ts`), sans aucun chiffre inventé.

```bash
pnpm --filter @ss-dropship/admin dev    # http://localhost:3002
pnpm --filter @ss-dropship/admin test   # 5 tests
```
