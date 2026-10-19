import { createAdminPostCollectionHandlers } from "@/lib/api/post-admin";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

const handlers = createAdminPostCollectionHandlers(
  POST_TYPE_CONFIG[PostType.WRITING]
);

export const GET = handlers.GET;
export const POST = handlers.POST;
