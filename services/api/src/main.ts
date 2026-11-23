import 'reflect-metadata';
import { creerApplication } from './application.js';
import { lireConfiguration } from './config.js';

const config = lireConfiguration();
const app = await creerApplication(config);
await app.listen(config.PORT);
console.log(`API SS DROPSHIP v${config.VERSION} à l'écoute sur le port ${config.PORT}`);
