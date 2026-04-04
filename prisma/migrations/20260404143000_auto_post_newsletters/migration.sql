CREATE TYPE "NewsletterCampaignKind" AS ENUM ('MANUAL', 'POST_PUBLISH');

CREATE TYPE "NewsletterCampaignStatus" AS ENUM ('SENT', 'PARTIAL', 'FAILED');

ALTER TABLE "SiteSettings"
ADD COLUMN "newsletterAutoPostPublishEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Post"
ADD COLUMN "notifySubscribersOnPublish" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "NewsletterCampaign"
ADD COLUMN "kind" "NewsletterCampaignKind" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "status" "NewsletterCampaignStatus" NOT NULL DEFAULT 'SENT',
ADD COLUMN "postId" TEXT;

ALTER TABLE "NewsletterCampaign"
ADD CONSTRAINT "NewsletterCampaign_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "NewsletterCampaign_postId_key" ON "NewsletterCampaign"("postId");
