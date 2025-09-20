/*
  Warnings:

  - Changed the type of `documentType` on the `UploadedDocuments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('FILE', 'WEBSITE', 'YOUTUBE_TRANSCRIPT', 'SUBTITLE');

-- AlterTable
ALTER TABLE "public"."UploadedDocuments" DROP COLUMN "documentType",
ADD COLUMN     "documentType" "public"."DocumentType" NOT NULL;
