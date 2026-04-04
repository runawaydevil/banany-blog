DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'Post'
  ) THEN
    EXECUTE '
      UPDATE "Post"
      SET "excerpt" = LEFT("excerpt", 300)
      WHERE "excerpt" IS NOT NULL AND char_length("excerpt") > 300
    ';

    EXECUTE 'ALTER TABLE "Post" DROP COLUMN IF EXISTS "seoTitle"';
    EXECUTE 'ALTER TABLE "Post" DROP COLUMN IF EXISTS "seoDesc"';
    EXECUTE 'ALTER TABLE "Post" ALTER COLUMN "excerpt" TYPE VARCHAR(300)';
  END IF;
END $$;
