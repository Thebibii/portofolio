import { createAdminPostItemHandlers } from "@/lib/api/post-admin";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

const handlers = createAdminPostItemHandlers(
  POST_TYPE_CONFIG[PostType.WRITING]
);

export const GET = handlers.GET;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
