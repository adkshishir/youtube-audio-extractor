/*
  Warnings:

  - You are about to drop the `Keyword` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Keyword` DROP FOREIGN KEY `Keyword_seoId_fkey`;

-- AlterTable
ALTER TABLE `SEO` ADD COLUMN `keywords` VARCHAR(191) NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `description` TEXT NULL;

-- DropTable
DROP TABLE `Keyword`;
