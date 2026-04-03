-- Truncate before VARCHAR(300)
UPDATE "Post"
SET "excerpt" = LEFT("excerpt", 300)
WHERE "excerpt" IS NOT NULL AND char_length("excerpt") > 300;

ALTER TABLE "Post" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE "Post" DROP COLUMN IF EXISTS "seoDesc";

ALTER TABLE "Post" ALTER COLUMN "excerpt" TYPE VARCHAR(300);
