import { createGuestPostViewHandler } from "@/lib/api/post-reaction";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

export const PATCH = createGuestPostViewHandler(
  POST_TYPE_CONFIG[PostType.BLOG]
);
