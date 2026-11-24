-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "derniereConnexionLe" TIMESTAMP(3),
ADD COLUMN     "mfaSecretChiffre" TEXT,
ADD COLUMN     "preferencesNotification" JSONB;

-- AlterTable
ALTER TABLE "CodeVerification" ADD COLUMN     "bloqueJusquau" TIMESTAMP(3);
