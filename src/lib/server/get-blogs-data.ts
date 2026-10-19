import "server-only";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { getPostsData } from "./get-posts-data";
import { PostType } from "@/types/blogs";

export const getBlogsData = () =>
  getPostsData(POST_TYPE_CONFIG[PostType.BLOG]).then(({ posts, ...rest }) => ({
    blogs: posts,
    ...rest,
  }));
