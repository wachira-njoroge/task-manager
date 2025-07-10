/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "task_code_key" ON "task"("code");
