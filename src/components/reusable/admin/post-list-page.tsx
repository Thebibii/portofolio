"use client";

import { AdminBlogsCard } from "@/components/reusable/admin/blogs/admin-blogs-card";
import SearchContent from "@/components/reusable/admin/search-content";
import { AdminPostsSkeleton } from "@/components/reusable/skeleton/AdminPostsSkeleton";
import { EmptyPosts } from "@/components/reusable/state/empty-presets";
import EmptyState from "@/components/reusable/state/empty-state";
import LoadingState from "@/components/reusable/state/loading-state";
import { Button } from "@/components/ui/button";
import { ADMIN_POST_HOOKS } from "@/hooks/react-query/admin/use-admin-posts";
import { useAdminCategory } from "@/hooks/react-query/admin/category/use-query";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { useToggleFeaturedPost } from "@/hooks/react-query/admin/posts/use-featured";
import type { PostTypeConfig } from "@/lib/post-type-config";
import { qk } from "@/lib/react-query/keys";
import { Post, PostDelete } from "@/types/blogs";
import { useQueryClient } from "@tanstack/react-query";
import { type LucideIcon, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface PostListPageProps {
  config: PostTypeConfig;
  emptyIcon?: LucideIcon;
}

export function PostListPage({ config, emptyIcon }: PostListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const tagId = searchParams.get("tagId") || "";

  const postHooks = ADMIN_POST_HOOKS[config.type];

  const { data, isLoading } = postHooks.useList({
    page,
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
    tagId: tagId || undefined,
  });
  const { data: categoryData } = useAdminCategory();
  const { data: tagData } = useAdminTag();
  const queryClient = useQueryClient();

  const updateParams = (
    updates: Record<string, string | number | undefined>
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage > 1 ? newPage : undefined });
  };

  // Any filter change resets back to page 1.
  const handleSearchChange = (value: string) => {
    updateParams({ search: value || undefined, page: undefined });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value || undefined, page: undefined });
  };

  const handleCategoryChange = (value: string) => {
    updateParams({ categoryId: value || undefined, page: undefined });
  };

  const handleTagChange = (value: string) => {
    updateParams({ tagId: value || undefined, page: undefined });
  };

  const handleClear = () => {
    router.replace(pathname, { scroll: false });
  };

  const { mutate } = postHooks.useDelete({
    onSuccess: (body) => {
      toast.success("Success", {
        description: body.message ?? "Success",
      });
      queryClient.invalidateQueries({ queryKey: qk.admin.posts(config.slug) });
      // Deleting the last item of a page past the first one: step back so the
      // user does not land on an empty page.
      if (page > 1 && (data?.data?.length ?? 0) <= 1) {
        handlePageChange(page - 1);
      }
    },
  });

  const { mutate: toggleFeatured } = useToggleFeaturedPost({
    onSuccess: (body) => {
      toast.success(body.message ?? "Success");
      queryClient.invalidateQueries({ queryKey: qk.admin.posts(config.slug) });
    },
    onError: (error) => {
      toast.error(error?.message || "Gagal mengubah featured status");
    },
  });

  const handleDelete = (post: PostDelete) => {
    mutate(post);
  };

  const handleToggleFeatured = (post: Post) => {
    toggleFeatured({ slug: post.slug, featured: !post.featured });
  };

  const createHref = `/admin/${config.slug}/create`;

  return (
    <div className="flex flex-col space-y-6">
      <LoadingState data={!isLoading} loadingFallback={<AdminPostsSkeleton />}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">
            {config.labelPlural}
          </h2>
          <Button asChild>
            <Link href={createHref}>Create {config.label}</Link>
          </Button>
        </div>

        <SearchContent
          search={search}
          status={status}
          categoryId={categoryId}
          tagId={tagId}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onCategoryChange={handleCategoryChange}
          onTagChange={handleTagChange}
          onClear={handleClear}
          categories={categoryData?.data}
          tags={tagData?.data}
        />

        <EmptyState
          data={data?.data}
          emptyFallback={
            <EmptyPosts
              variant="admin"
              icon={emptyIcon}
              title={config.adminEmptyTitle}
              description={config.adminEmptyDescription}
              action={
                <Button asChild>
                  <Link href={createHref}>
                    <Plus className="h-4 w-4 mr-2" />
                    {config.adminEmptyCta}
                  </Link>
                </Button>
              }
            />
          }
        >
          <div className="grid grid-rows-1 gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {data?.data?.map((item: Post) => (
              <AdminBlogsCard
                post={item}
                key={item.id}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
                href={config.slug}
              />
            ))}
          </div>
        </EmptyState>

        {data?.meta && data.meta.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Total {data.meta.total} {config.adminTotalLabel}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={!data.meta.hasPrevPage}
              >
                Sebelumnya
              </Button>
              <p className="text-sm text-muted-foreground">
                Halaman {data.meta.page} dari {data.meta.totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={!data.meta.hasNextPage}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </LoadingState>
    </div>
  );
}
