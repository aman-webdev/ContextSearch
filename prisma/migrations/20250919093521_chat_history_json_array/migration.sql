/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "chatHistory" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- DropTable
DROP TABLE "public"."Chat";
