-- CreateTable
CREATE TABLE `CertificateShare` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shareId` VARCHAR(191) NOT NULL,
    `studentCertificateId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CertificateShare_shareId_key`(`shareId`),
    UNIQUE INDEX `CertificateShare_studentCertificateId_key`(`studentCertificateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CertificateShare` ADD CONSTRAINT `CertificateShare_studentCertificateId_fkey` FOREIGN KEY (`studentCertificateId`) REFERENCES `StudentCertificate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
