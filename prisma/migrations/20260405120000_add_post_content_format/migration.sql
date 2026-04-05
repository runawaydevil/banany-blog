-- CreateEnum
CREATE TYPE "PostContentFormat" AS ENUM ('RICH_TEXT', 'MARKDOWN');

-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "contentFormat" "PostContentFormat" NOT NULL DEFAULT 'RICH_TEXT';
