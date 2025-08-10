/*
  Warnings:

  - A unique constraint covering the columns `[confirmCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "confirmCode" TEXT,
ADD COLUMN     "confirmCodeDate" TIMESTAMP(3),
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_confirmCode_key" ON "public"."users"("confirmCode");
