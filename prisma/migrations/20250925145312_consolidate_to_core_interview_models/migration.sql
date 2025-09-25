/*
  Warnings:

  - The `overallResult` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `HiringAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HiringQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ApplicationResult" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- DropForeignKey
ALTER TABLE "public"."HiringAnswer" DROP CONSTRAINT "HiringAnswer_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HiringAnswer" DROP CONSTRAINT "HiringAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HiringQuestion" DROP CONSTRAINT "HiringQuestion_positionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobApplication" DROP CONSTRAINT "JobApplication_positionId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "resumeUrl" TEXT,
DROP COLUMN "overallResult",
ADD COLUMN     "overallResult" "public"."ApplicationResult" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."HiringAnswer";

-- DropTable
DROP TABLE "public"."HiringQuestion";

-- DropTable
DROP TABLE "public"."JobApplication";

-- DropEnum
DROP TYPE "public"."ApplicationStatus";
