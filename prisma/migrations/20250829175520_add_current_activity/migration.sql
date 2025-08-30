-- CreateTable
CREATE TABLE "public"."CurrentActivity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentActivity_pkey" PRIMARY KEY ("id")
);
