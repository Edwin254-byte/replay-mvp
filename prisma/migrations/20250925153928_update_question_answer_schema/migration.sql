/*
  Warnings:

  - You are about to drop the column `prompt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Question` table. All the data in the column will be lost.
  - Added the required column `response` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Answer" DROP CONSTRAINT "Answer_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_positionId_fkey";

-- AlterTable
ALTER TABLE "public"."Answer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "response" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "recordedMeta" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "prompt",
DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "options" TEXT,
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "type" "public"."QuestionType" NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "order" SET DEFAULT 0,
ALTER COLUMN "voiceType" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
