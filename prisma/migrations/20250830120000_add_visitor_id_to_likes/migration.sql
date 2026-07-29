-- AlterTable: users (menambahkan field untuk lockout setelah gagal login)
ALTER TABLE "public"."users" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "public"."users" ADD COLUMN     "lockoutUntil" TIMESTAMP(3);

-- AlterTable: likes (ganti primary identifier dari IP ke visitorId cookie)
ALTER TABLE "public"."likes" ADD COLUMN     "visitorId" TEXT;
DROP INDEX IF EXISTS "public"."likes_ipAddress_postId_key";
ALTER TABLE "public"."likes" ALTER COLUMN "ipAddress" DROP NOT NULL;
CREATE UNIQUE INDEX "likes_visitorId_postId_key" ON "public"."likes"("visitorId", "postId");
