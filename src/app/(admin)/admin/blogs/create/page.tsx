"use client";
import { FormCreatePost } from "@/components/reusable/admin/blogs/form-create-post";
import { BlogFormSkeleton } from "@/components/reusable/skeleton/blog-form-skeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import { useCreateBlog } from "@/hooks/react-query/admin/blogs/use-mutation";
import { useAdminCategory } from "@/hooks/react-query/admin/category/use-query";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  // const navigate = usee();
  const { data: tag, isLoading: isLoadingTag } = useAdminTag();
  const { data: categories, isLoading: isLoadingCategories } =
    useAdminCategory();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate } = useCreateBlog({
    onSuccess: (data) => {
      toast.success("Post created successfully", {
        description: `"${data.title}" has been created and saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.blogs"] });
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
    router.push("/admin/blogs");
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
        data={!isLoadingTag && !isLoadingCategories}
        loadingFallback={<BlogFormSkeleton />}
      >
        {/* Form */}
        <FormCreatePost
          categories={categories?.data}
          tags={tag?.data}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </LoadingState>
    </div>
  );
}
