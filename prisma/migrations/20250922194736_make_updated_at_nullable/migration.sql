-- AlterTable
ALTER TABLE `student` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    ADD COLUMN `updatedAt` DATETIME(3) NULL;
