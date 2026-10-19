import { createGuestPostDetailHandler } from "@/lib/api/post-detail";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

export const GET = createGuestPostDetailHandler(
  POST_TYPE_CONFIG[PostType.BLOG]
);
