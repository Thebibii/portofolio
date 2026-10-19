import { createGuestPostListHandler } from "@/lib/api/post-list";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

export const GET = createGuestPostListHandler(
  POST_TYPE_CONFIG[PostType.WRITING]
);
