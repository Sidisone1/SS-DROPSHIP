-- SS DROPSHIP — protections en base de données (ADR-002). Elles complètent les contrôles de l'API :
-- même un bug applicatif ou un accès direct ne peut pas modifier l'historique financier.

-- 1. Tables en écriture seule : ni UPDATE ni DELETE.
CREATE OR REPLACE FUNCTION ss_refuser_modification() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Table en écriture seule : % interdit sur %', TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ecriture_ledger_immuable BEFORE UPDATE OR DELETE ON "EcritureLedger"
  FOR EACH ROW EXECUTE FUNCTION ss_refuser_modification();
CREATE TRIGGER transaction_ledger_immuable BEFORE UPDATE OR DELETE ON "TransactionLedger"
  FOR EACH ROW EXECUTE FUNCTION ss_refuser_modification();
CREATE TRIGGER journal_audit_immuable BEFORE UPDATE OR DELETE ON "JournalAudit"
  FOR EACH ROW EXECUTE FUNCTION ss_refuser_modification();
CREATE TRIGGER evenement_commande_immuable BEFORE UPDATE OR DELETE ON "EvenementCommande"
  FOR EACH ROW EXECUTE FUNCTION ss_refuser_modification();
CREATE TRIGGER evenement_suivi_immuable BEFORE UPDATE OR DELETE ON "EvenementSuivi"
  FOR EACH ROW EXECUTE FUNCTION ss_refuser_modification();

-- 2. Une écriture n'est jamais nulle, et sa devise est celle du compte.
ALTER TABLE "EcritureLedger" ADD CONSTRAINT ecriture_non_nulle CHECK ("montant" <> 0);

CREATE OR REPLACE FUNCTION ss_verifier_devise_ecriture() RETURNS trigger AS $$
DECLARE devise_compte char(3);
BEGIN
  SELECT "devise" INTO devise_compte FROM "CompteWallet" WHERE "id" = NEW."compteId";
  IF devise_compte IS DISTINCT FROM NEW."devise" THEN
    RAISE EXCEPTION 'Devise % différente de celle du compte (%)', NEW."devise", devise_compte
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ecriture_devise_compte BEFORE INSERT ON "EcritureLedger"
  FOR EACH ROW EXECUTE FUNCTION ss_verifier_devise_ecriture();

-- 3. Partie double : à la fin de la transaction SQL, chaque transaction du ledger est équilibrée par devise,
--    et aucun compte client ne passe en négatif.
CREATE OR REPLACE FUNCTION ss_verifier_equilibre() RETURNS trigger AS $$
DECLARE desequilibre record;
DECLARE solde bigint;
DECLARE type_compte text;
BEGIN
  SELECT "devise", SUM("montant") AS total INTO desequilibre
    FROM "EcritureLedger" WHERE "transactionId" = NEW."transactionId"
    GROUP BY "devise" HAVING SUM("montant") <> 0 LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'Transaction % déséquilibrée en % (écart %)', NEW."transactionId", desequilibre."devise", desequilibre.total
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT "type"::text INTO type_compte FROM "CompteWallet" WHERE "id" = NEW."compteId";
  IF type_compte IN ('client_principal', 'client_recompenses') THEN
    SELECT COALESCE(SUM("montant"), 0) INTO solde FROM "EcritureLedger" WHERE "compteId" = NEW."compteId";
    IF solde < 0 THEN
      RAISE EXCEPTION 'Solde négatif interdit sur le compte client % (%)', NEW."compteId", solde
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ledger_equilibre AFTER INSERT ON "EcritureLedger"
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION ss_verifier_equilibre();

-- 4. Un utilisateur a au moins un moyen de contact.
ALTER TABLE "Utilisateur" ADD CONSTRAINT utilisateur_contact CHECK ("telephone" IS NOT NULL OR "email" IS NOT NULL);

-- 5. Montants positifs là où un montant négatif n'a pas de sens.
ALTER TABLE "TentativePaiement" ADD CONSTRAINT tentative_montant_positif CHECK ("montant" > 0);
ALTER TABLE "Offre" ADD CONSTRAINT offre_montants_positifs
  CHECK ("montantProduit" >= 0 AND "fraisService" >= 0 AND "transportVersEntrepot" >= 0 AND "quantite" > 0);

-- 6. Les prestations V2 ne peuvent pas être rendues disponibles par une simple mise à jour (D-011) :
--    lever cette contrainte exige une nouvelle migration, donc une décision tracée et une revue de code.
ALTER TABLE "OptionService" ADD CONSTRAINT option_v2_indisponible CHECK ("disponible" = false);
INSERT INTO "OptionService" ("code", "cleLibelle", "disponible") VALUES
  ('inspection_qc', 'options.inspection_qc', false),
  ('photos_contenu', 'options.photos_contenu', false),
  ('video_contenu', 'options.video_contenu', false),
  ('regroupement', 'options.regroupement', false),
  ('reconditionnement', 'options.reconditionnement', false);

-- 7. Pays de lancement (D-021). Les autres pays sont créés fermés.
INSERT INTO "Pays" ("code", "nom", "deviseParDefaut", "indicatif", "langueParDefaut", "ouvert", "moyensPaiement") VALUES
  ('ML', 'Mali', 'XOF', '+223', 'fr', true, '["orange_money", "moov_money"]'),
  ('CI', 'Côte d''Ivoire', 'XOF', '+225', 'fr', false, '[]'),
  ('GN', 'Guinée', 'GNF', '+224', 'fr', false, '[]'),
  ('GH', 'Ghana', 'GHS', '+233', 'en', false, '[]');
