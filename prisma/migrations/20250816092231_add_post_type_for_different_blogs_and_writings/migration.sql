-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('BLOG', 'WRITING');

-- AlterTable
ALTER TABLE "public"."posts" ADD COLUMN     "type" "public"."PostType" NOT NULL DEFAULT 'BLOG';
