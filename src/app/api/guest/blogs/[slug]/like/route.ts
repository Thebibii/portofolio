import { createGuestPostReactionHandlers } from "@/lib/api/post-reaction";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

const handlers = createGuestPostReactionHandlers(
  POST_TYPE_CONFIG[PostType.BLOG]
);

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
