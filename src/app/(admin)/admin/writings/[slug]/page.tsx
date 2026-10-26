"use client";
import { FormCreatePost } from "@/components/reusable/admin/blogs/form-create-post";
import { PostFormSkeleton } from "@/components/reusable/skeleton/post-form-skeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import { useAdminCategory } from "@/hooks/react-query/admin/category/use-query";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { useUpdateWriting } from "@/hooks/react-query/admin/writings/use-mutation";
import { useAdminWritingBySlug } from "@/hooks/react-query/admin/writings/use-query";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/react-query/keys";
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

  const { mutate } = useUpdateWriting({
    slug: params.slug,
    onSuccess: (data) => {
      // The list prefix also covers the detail key, so both the editor cache
      // and the list are refreshed (staleTime would otherwise hide the edit).
      queryClient.invalidateQueries({ queryKey: qk.admin.writings });
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
        <h1 className="text-3xl font-bold">Create New Writing</h1>
        <p className="text-muted-foreground">
          Write and publish a new writing post
        </p>
      </div>

      <LoadingState
        data={!isLoadingTag && !isLoadingCategories && !isLoadingPost}
        loadingFallback={<PostFormSkeleton />}
      >
        {/* Form */}
        <FormCreatePost
          post={post?.data}
          categories={categories?.data}
          tags={tag?.data}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          uploadBucket="posts"
          uploadFolder="writing/description"
        />
      </LoadingState>
    </div>
  );
}
