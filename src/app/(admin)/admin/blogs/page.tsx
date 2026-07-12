"use client";
import { useState, useCallback } from "react";
import { AdminBlogsCard } from "@/components/reusable/admin/blogs/admin-blogs-card";
import SearchContent from "@/components/reusable/admin/search-content";
import { AdminBlogsSkeleton } from "@/components/reusable/skeleton/AdminBlogsSkeleton";
import EmptyState from "@/components/reusable/state/empty-state";
import LoadingState from "@/components/reusable/state/loading-state";
import { Button } from "@/components/ui/button";
import { useDeleteBlog, useToggleFeaturedPost } from "@/hooks/react-query/admin/blogs/use-mutation";
import { useAdminBlogs } from "@/hooks/react-query/admin/blogs/use-query";
import { useAdminCategory } from "@/hooks/react-query/admin/category/use-query";
import { useAdminTag } from "@/hooks/react-query/admin/tag/use-query";
import { Post, PostDelete } from "@/types/blogs";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Page() {
  const { data, isLoading } = useAdminBlogs();
  const { data: categoryData } = useAdminCategory();
  const { data: tagData } = useAdminTag();
  const queryClient = useQueryClient();
  const [filteredData, setFilteredData] = useState<Post[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const { mutate } = useDeleteBlog({
    onSuccess: (body) => {
      toast.success("Success", {
        description: body.message,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.blogs"] });
    },
  });

  const { mutate: toggleFeatured } = useToggleFeaturedPost({
    onSuccess: (body) => {
      toast.success(body.message);
      queryClient.invalidateQueries({ queryKey: ["get.admin.blogs"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Gagal mengubah featured status");
    },
  });

  const handleDelete = (data: PostDelete) => {
    mutate(data);
  };

  const handleToggleFeatured = (post: Post) => {
    toggleFeatured({ slug: post.slug, featured: !post.featured });
  };

  const handleSearchResults = useCallback((results: Post[]) => {
    setFilteredData(results);
    setHasFiltered(true);
  }, []);

  const itemsToShow = hasFiltered ? filteredData : data?.data;

  return (
    <div className="flex flex-col space-y-6">
      <LoadingState data={!isLoading} loadingFallback={<AdminBlogsSkeleton />}>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Blogs</h2>
          <Button asChild>
            <Link href="/admin/blogs/create">Create Blog</Link>
          </Button>
        </div>

        <SearchContent
          data={data?.data}
          onSearchResults={handleSearchResults}
          categories={categoryData?.data}
          tags={tagData?.data}
        />

        <EmptyState
          data={itemsToShow}
          emptyFallback={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No blogs yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Get started by creating your first blog.
              </p>
              <Button asChild>
                <Link href="/admin/blogs/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first blog
                </Link>
              </Button>
            </div>
          }
        >
          <div className="grid grid-rows-1 gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {itemsToShow?.map((item: Post) => (
              <AdminBlogsCard
                post={item}
                key={item.id}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
                href="blogs"
              />
            ))}
          </div>
        </EmptyState>
      </LoadingState>
    </div>
  );
}
