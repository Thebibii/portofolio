"use client";
import { Suspense } from "react";
import { AdminBlogsCard } from "@/components/reusable/admin/blogs/admin-blogs-card";
import SearchContent from "@/components/reusable/admin/search-content";
import { AdminPostsSkeleton } from "@/components/reusable/skeleton/AdminPostsSkeleton";
import EmptyState from "@/components/reusable/state/empty-state";
import LoadingState from "@/components/reusable/state/loading-state";
import { Button } from "@/components/ui/button";
import { useDeleteWriting } from "@/hooks/react-query/admin/writings/use-mutation";
import { useToggleFeaturedPost } from "@/hooks/react-query/admin/blogs/use-mutation";
import { useAdminWritings } from "@/hooks/react-query/admin/writings/use-query";
import { useAdminCategory } from "@/hooks/react-query/admin/category/use-query";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { Post, PostDelete } from "@/types/blogs";
import { useQueryClient } from "@tanstack/react-query";
import { NotebookText, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function AdminWritingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const tagId = searchParams.get("tagId") || "";

  const { data, isLoading } = useAdminWritings({
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

  const { mutate } = useDeleteWriting({
    onSuccess: (body) => {
      toast.success("Success", {
        description: body.message ?? "Success",
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.writings"] });
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
      queryClient.invalidateQueries({ queryKey: ["get.admin.writings"] });
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

  return (
    <div className="flex flex-col space-y-6">
      <LoadingState data={!isLoading} loadingFallback={<AdminPostsSkeleton />}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Writings</h2>
          <Button asChild>
            <Link href="/admin/writings/create">Create Writing</Link>
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <NotebookText className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No writings yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Get started by creating your first writing.
              </p>
              <Button asChild>
                <Link href="/admin/writings/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first writing
                </Link>
              </Button>
            </div>
          }
        >
          <div className="grid grid-rows-1 gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {data?.data?.map((item: Post) => (
              <AdminBlogsCard
                post={item}
                key={item.id}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
                href="writings"
              />
            ))}
          </div>
        </EmptyState>

        {data?.meta && data.meta.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Total {data.meta.total} writing
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

export default function Page() {
  return (
    <Suspense fallback={<AdminPostsSkeleton />}>
      <AdminWritingsContent />
    </Suspense>
  );
}
