-- CreateEnum
CREATE TYPE "ContentLocale" AS ENUM ('en', 'pt');

-- CreateTable
CREATE TABLE "PostGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTranslation" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "locale" "ContentLocale" NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'POST',
    "title" TEXT,
    "slug" TEXT NOT NULL,
    "contentFormat" "PostContentFormat" NOT NULL DEFAULT 'RICH_TEXT',
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "notifySubscribersOnPublish" BOOLEAN NOT NULL DEFAULT true,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkUrl" TEXT,
    "previewToken" TEXT,
    "previewEnabledAt" TIMESTAMP(3),
    "previewRevokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostTranslation_slug_key" ON "PostTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PostTranslation_previewToken_key" ON "PostTranslation"("previewToken");

-- CreateIndex
CREATE UNIQUE INDEX "PostTranslation_groupId_locale_key" ON "PostTranslation"("groupId", "locale");

-- AddForeignKey
ALTER TABLE "PostTranslation" ADD CONSTRAINT "PostTranslation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PostGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
