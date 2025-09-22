/*
  Warnings:

  - Made the column `takenAt` on table `studentexam` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `studentexam` MODIFY `takenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
