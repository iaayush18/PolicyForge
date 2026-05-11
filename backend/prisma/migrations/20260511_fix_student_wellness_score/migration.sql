-- Safely converge older databases that still use the legacy student score column
-- onto the current Prisma schema field: currentWellnessScore.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Student'
      AND column_name = 'currentRiskScore'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Student'
      AND column_name = 'currentWellnessScore'
  ) THEN
    UPDATE "Student"
    SET "currentWellnessScore" = "currentRiskScore"
    WHERE "currentWellnessScore" IS NULL OR "currentWellnessScore" = 0;

    ALTER TABLE "Student" DROP COLUMN "currentRiskScore";
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Student'
      AND column_name = 'currentRiskScore'
  ) THEN
    ALTER TABLE "Student" RENAME COLUMN "currentRiskScore" TO "currentWellnessScore";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Student'
      AND column_name = 'currentWellnessScore'
  ) THEN
    ALTER TABLE "Student"
    ADD COLUMN "currentWellnessScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
  END IF;
END $$;
