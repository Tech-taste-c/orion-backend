-- CreateTable
CREATE TABLE `StudentExamAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentExamId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `optionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentExamAnswer` ADD CONSTRAINT `StudentExamAnswer_studentExamId_fkey` FOREIGN KEY (`studentExamId`) REFERENCES `StudentExam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentExamAnswer` ADD CONSTRAINT `StudentExamAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `ExamQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentExamAnswer` ADD CONSTRAINT `StudentExamAnswer_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `QuestionOption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
