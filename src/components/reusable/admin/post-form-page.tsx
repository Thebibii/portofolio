"use client";

import { FormCreatePost } from "@/components/reusable/admin/blogs/form-create-post";
import { PostFormSkeleton } from "@/components/reusable/skeleton/post-form-skeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import { useAdminCategory } from "@/hooks/react-query/admin/category/use-query";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { ADMIN_POST_HOOKS } from "@/hooks/react-query/admin/use-admin-posts";
import type { PostTypeConfig } from "@/lib/post-type-config";
import { qk } from "@/lib/react-query/keys";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface PostFormPageProps {
  config: PostTypeConfig;
  mode: "create" | "edit";
}

const handleMutationError = (error: any) => {
  const message =
    error instanceof Error
      ? error.message
      : "Terjadi kesalahan yang tidak diketahui";

  toast.error("Error", {
    description: message,
  });
};

function PostFormHeader({ config, mode }: PostFormPageProps) {
  const title =
    mode === "create" ? config.adminCreateTitle : config.adminEditTitle;
  const description =
    mode === "create"
      ? config.adminCreateDescription
      : config.adminEditDescription;

  return (
    // Header
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PostCreateForm({ config }: { config: PostTypeConfig }) {
  const { data: tag, isLoading: isLoadingTag } = useAdminTag();
  const { data: categories, isLoading: isLoadingCategories } =
    useAdminCategory();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate } = ADMIN_POST_HOOKS[config.type].useCreate({
    onSuccess: (data) => {
      toast.success("Post created successfully", {
        description: `"${data.data.title}" has been created and saved.`,
      });
      queryClient.invalidateQueries({
        queryKey: qk.admin.posts(config.slug),
      });
      router.back();
    },
    onError: handleMutationError,
  });

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  const handleCancel = () => {
    router.push(`/admin/${config.slug}`);
  };

  return (
    <div className="space-y-6">
      <PostFormHeader config={config} mode="create" />

      <LoadingState
        data={!isLoadingTag && !isLoadingCategories}
        loadingFallback={<PostFormSkeleton />}
      >
        {/* Form */}
        <FormCreatePost
          categories={categories?.data}
          tags={tag?.data}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          uploadBucket="posts"
          uploadFolder={config.adminUploadFolder}
        />
      </LoadingState>
    </div>
  );
}

function PostEditForm({ config }: { config: PostTypeConfig }) {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const queryClient = useQueryClient();
  const { data: tag, isLoading: isLoadingTag } = useAdminTag();
  const postHooks = ADMIN_POST_HOOKS[config.type];
  const { data: post, isLoading: isLoadingPost } = postHooks.useBySlug({
    slug,
  });
  const { data: categories, isLoading: isLoadingCategories } =
    useAdminCategory();

  const { mutate } = postHooks.useUpdate({
    slug,
    onSuccess: (data) => {
      // The list prefix also covers the detail key, so both the editor cache
      // and the list are refreshed (staleTime would otherwise hide the edit).
      toast.success("Post updated successfully", {
        description: `"${data?.data?.title}" has been updated and saved.`,
      });
      queryClient.invalidateQueries({
        queryKey: qk.admin.posts(config.slug),
      });
      router.back();
    },
    onError: handleMutationError,
  });

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <PostFormHeader config={config} mode="edit" />

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
          uploadFolder={config.adminUploadFolder}
        />
      </LoadingState>
    </div>
  );
}

export function PostFormPage({ config, mode }: PostFormPageProps) {
  return mode === "create" ? (
    <PostCreateForm config={config} />
  ) : (
    <PostEditForm config={config} />
  );
}
