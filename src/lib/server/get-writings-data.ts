import "server-only";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { getPostsData } from "./get-posts-data";
import { PostType } from "@/types/blogs";

export const getWritingsData = () =>
  getPostsData(POST_TYPE_CONFIG[PostType.WRITING]).then(
    ({ posts, ...rest }) => ({
      writings: posts,
      ...rest,
    })
  );
