-- AlterTable
ALTER TABLE `Attendance` ADD COLUMN `earlyLeaveDuration` INTEGER NULL,
    ADD COLUMN `isEarlyLeave` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isLate` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `lateDuration` INTEGER NULL;
