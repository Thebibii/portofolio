"use client";
import { PostFormPage } from "@/components/reusable/admin/post-form-page";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

export default function Page() {
  return (
    <PostFormPage config={POST_TYPE_CONFIG[PostType.BLOG]} mode="create" />
  );
}
