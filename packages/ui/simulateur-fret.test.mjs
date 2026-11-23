// Tests du simulateur de fret — node --test packages/ui/simulateur-fret.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { simulerFret, verifierArticle } from "./simulateur-fret.mjs";

test("aérien : le poids réel est facturé s'il dépasse le volumétrique", () => {
  const r = simulerFret({ mode: "aerien", pays: "CI", poidsKg: 3.2, longueurCm: 30, largeurCm: 20, hauteurCm: 10 });
  assert.equal(r.quantiteFacturee, 3.5); // arrondi au 0,5 kg supérieur
  assert.equal(r.fret, 3.5 * 9800);
});

test("express : le poids volumétrique l'emporte pour un colis léger et grand", () => {
  const r = simulerFret({ mode: "express", pays: "GH", poidsKg: 1, longueurCm: 60, largeurCm: 40, hauteurCm: 40 });
  assert.equal(r.quantiteFacturee, 16); // 96 000 / 6 000
  assert.equal(r.total, 16 * 14000);
});

test("maritime : facturé au m³ avec un minimum et marqué phase 2", () => {
  const r = simulerFret({ mode: "maritime", pays: "GN", longueurCm: 20, largeurCm: 20, hauteurCm: 20 });
  assert.equal(r.quantiteFacturee, 0.1);
  assert.equal(r.fret, 28500);
  assert.equal(r.phase2, true);
});

test("assurance optionnelle : 2 % de la valeur déclarée", () => {
  const r = simulerFret({ mode: "aerien", pays: "CI", poidsKg: 2, valeurDeclaree: 300000, assurance: true });
  assert.equal(r.assurance, 6000);
  assert.equal(r.total, r.fret + 6000);
});

test("refuse un pays non couvert ou une valeur négative", () => {
  assert.throws(() => simulerFret({ mode: "aerien", pays: "FR", poidsKg: 1 }));
  assert.throws(() => simulerFret({ mode: "aerien", pays: "CI", poidsKg: -1 }));
});

test("articles interdits selon le mode", () => {
  assert.equal(verifierArticle("express", "batteries_seules").autorise, false);
  assert.equal(verifierArticle("maritime", "batteries_seules").autorise, true);
  assert.equal(verifierArticle("maritime", "armes").autorise, false);
  assert.equal(verifierArticle("express", "telephones").autorise, true);
});
