-- AlterTable
ALTER TABLE "Post" ADD COLUMN "groupId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_groupId_key" ON "Post"("groupId");

-- AddForeignKey
ALTER TABLE "Post"
ADD CONSTRAINT "Post_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "PostGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

