import "server-only";
import prisma from "@/lib/prisma";
import type { BucketItemData } from "@/types/bucketlist";
import { cache } from "react";

export const getBucketlistData = cache(async (): Promise<BucketItemData[]> => {
  const items = await prisma.bucketItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    completed: item.completed,
    completedAt: item.completedAt ? item.completedAt.toISOString() : null,
    images: item.images,
    order: item.order,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
});
