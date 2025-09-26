-- CreateEnum
CREATE TYPE "public"."EvaluationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Answer" ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "evaluationStatus" "public"."EvaluationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalScore" INTEGER;

-- AlterTable
ALTER TABLE "public"."Position" ADD COLUMN     "farewellText" TEXT,
ADD COLUMN     "introText" TEXT;

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "correctOption" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 1;
