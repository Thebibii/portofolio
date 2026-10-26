"use client";

import { Suspense } from "react";
import PostListShell, {
  type PostListInitialData,
} from "@/components/reusable/guest/post-list/PostListShell";
import { BlogsSkeleton } from "@/components/reusable/skeleton/blogs-skeleton";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

type Props = {
  initialBlogs?: PostListInitialData;
  initialCategories?: any;
  initialTags?: any;
};

export default function BlogsClient({
  initialBlogs,
  initialCategories,
  initialTags,
}: Props) {
  return (
    <Suspense fallback={<BlogsSkeleton />}>
      <PostListShell
        config={POST_TYPE_CONFIG[PostType.BLOG]}
        initialData={initialBlogs}
        initialCategories={initialCategories}
        initialTags={initialTags}
      />
    </Suspense>
  );
}
