-- CreateEnum
CREATE TYPE "public"."QuestionSource" AS ENUM ('MANUAL', 'AI_GENERATED', 'AI_SUGGESTED');

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "aiPrompt" TEXT,
ADD COLUMN     "generatedAt" TIMESTAMP(3),
ADD COLUMN     "source" "public"."QuestionSource" NOT NULL DEFAULT 'MANUAL';
