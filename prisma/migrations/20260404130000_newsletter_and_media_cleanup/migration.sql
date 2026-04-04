ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "fontBodyKey";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "fontHeadingKey";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "fontMonoKey";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "siteImageMediaId";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "seoOgImageId";

DROP TABLE IF EXISTS "FontAsset";

ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "unsubscribeToken" TEXT;
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "unsubscribedAt" TIMESTAMP(3);
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Subscriber'
      AND column_name = 'token'
  ) THEN
    EXECUTE $sql$
      UPDATE "Subscriber"
      SET "unsubscribeToken" = COALESCE(
        "unsubscribeToken",
        "token",
        md5("email" || ':' || clock_timestamp()::text)
      )
      WHERE "unsubscribeToken" IS NULL
    $sql$;
  ELSE
    EXECUTE $sql$
      UPDATE "Subscriber"
      SET "unsubscribeToken" = COALESCE(
        "unsubscribeToken",
        md5("email" || ':' || clock_timestamp()::text)
      )
      WHERE "unsubscribeToken" IS NULL
    $sql$;
  END IF;
END $$;

ALTER TABLE "Subscriber" ALTER COLUMN "unsubscribeToken" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Subscriber_unsubscribeToken_key'
  ) THEN
    CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");
  END IF;
END $$;

ALTER TABLE "Subscriber" DROP COLUMN IF EXISTS "confirmed";
ALTER TABLE "Subscriber" DROP COLUMN IF EXISTS "token";

CREATE TABLE IF NOT EXISTS "NewsletterCampaign" (
  "id" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "previewText" VARCHAR(300),
  "bodyHtml" TEXT NOT NULL,
  "bodyText" TEXT NOT NULL,
  "recipientCount" INTEGER NOT NULL,
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NewsletterCampaign_pkey" PRIMARY KEY ("id")
);
