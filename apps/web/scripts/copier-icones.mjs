// Copie les icônes 3D Bogolan de référence (D-018) dans public/icones, sans les dupliquer dans Git.
import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../../../design/icons/bogolan/png/', import.meta.url));
const cible = fileURLToPath(new URL('../public/icones/', import.meta.url));
mkdirSync(cible, { recursive: true });
cpSync(source, cible, { recursive: true });
