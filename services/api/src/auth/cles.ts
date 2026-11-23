import type { Configuration } from '../config.js';
import { deriverCle } from '../securite/secrets.js';

export const CLES = Symbol('CLES');

export interface Cles {
  jetons: Buffer;
  codes: Buffer;
  mfa: Buffer;
}

export const creerCles = (config: Configuration): Cles => ({
  jetons: deriverCle(config.APP_SECRET, 'jetons'),
  codes: deriverCle(config.APP_SECRET, 'codes'),
  mfa: deriverCle(config.APP_SECRET, 'mfa'),
});
