"use client";
import PostDetailLayout, {
  type PostData,
} from "@/components/reusable/guest/post-detail-layout";
import { POST_TYPE_CONFIG } from "@/lib/post-type-config";
import { PostType } from "@/types/blogs";

type Props = {
  post: PostData;
  slug: string;
};

export default function WritingDetailClient(props: Props) {
  return (
    <PostDetailLayout {...props} config={POST_TYPE_CONFIG[PostType.WRITING]} />
  );
}
