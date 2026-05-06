-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "previewToken" TEXT,
ADD COLUMN "previewEnabledAt" TIMESTAMP(3),
ADD COLUMN "previewRevokedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Post_previewToken_key" ON "Post"("previewToken");

