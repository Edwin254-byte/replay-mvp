/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `farewellText` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `introText` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `Position` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `userId` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Position` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('MANAGER', 'APPLICANT');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('TEXT', 'MULTIPLE_CHOICE');

-- DropIndex
DROP INDEX "public"."Position_publicId_key";

-- AlterTable
ALTER TABLE "public"."Position" DROP COLUMN "createdBy",
DROP COLUMN "farewellText",
DROP COLUMN "introText",
DROP COLUMN "publicId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'APPLICANT';

-- CreateTable
CREATE TABLE "public"."HiringQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL DEFAULT 'TEXT',
    "positionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiringQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HiringAnswer" (
    "id" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiringAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HiringQuestion" ADD CONSTRAINT "HiringQuestion_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HiringAnswer" ADD CONSTRAINT "HiringAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HiringAnswer" ADD CONSTRAINT "HiringAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."HiringQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
