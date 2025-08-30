"use client";
import { FormCreatePost } from "@/components/reusable/admin/blogs/form-create-post";
import { BlogFormSkeleton } from "@/components/reusable/skeleton/blog-form-skeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import { Button } from "@/components/ui/button";
import {
  useCreateBlog,
  useUpdateBlog,
} from "@/hooks/react-query/admin/blogs/use-mutation";
import { useAdminCategory } from "@/hooks/react-query/admin/category/use-query";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { useAdminWritingBySlug } from "@/hooks/react-query/admin/writings/use-query";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { data: tag, isLoading: isLoadingTag } = useAdminTag();
  const { data: post, isLoading: isLoadingPost } = useAdminWritingBySlug({
    slug: params.slug,
  });
  const { data: categories, isLoading: isLoadingCategories } =
    useAdminCategory();

  const { mutate } = useUpdateBlog({
    slug: params.slug,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["get.admin.blogs", params.slug],
      });
      toast.success("Post updated successfully", {
        description: `"${data?.data?.title}" has been updated and saved.`,
      });
      router.back();
    },
    onError: (error: any) => {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui";

      toast.error("Error", {
        description: message,
      });
    },
  });
  const handleSubmit = (data: any) => {
    mutate(data);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">
          Write and publish a new blog post
        </p>
      </div>

      <LoadingState
        data={!isLoadingTag && !isLoadingCategories && !isLoadingPost}
        loadingFallback={<BlogFormSkeleton />}
      >
        {/* Form */}
        <FormCreatePost
          post={post?.data}
          categories={categories?.data}
          tags={tag?.data}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </LoadingState>
    </div>
  );
}
