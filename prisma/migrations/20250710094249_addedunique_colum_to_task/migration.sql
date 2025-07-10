/*
  Warnings:

  - Added the required column `code` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "task" ADD COLUMN     "code" VARCHAR(10) NOT NULL;
