"use client";
import { Suspense } from "react";
import { PostListPage } from "@/components/reusable/admin/post-list-page";
import { AdminPostsSkeleton } from "@/components/reusable/skeleton/AdminPostsSkeleton";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";
import { NotebookText } from "lucide-react";

export default function Page() {
  return (
    <Suspense fallback={<AdminPostsSkeleton />}>
      <PostListPage
        config={POST_TYPE_CONFIG[PostType.WRITING]}
        emptyIcon={NotebookText}
      />
    </Suspense>
  );
}
