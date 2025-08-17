"use client";
import { AdminBlogsCard } from "@/components/reusable/admin/blogs/admin-blogs-card";
import { AdminBlogsSkeleton } from "@/components/reusable/skeleton/AdminBlogsSkeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import { Button } from "@/components/ui/button";
import { useDeleteBlog } from "@/hooks/react-query/admin/blogs/use-mutation";
import { useAdminBlogs } from "@/hooks/react-query/admin/blogs/use-query";
import { Post, PostDelete } from "@/types/blogs";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

export default function Page() {
  const { data, isLoading } = useAdminBlogs();
  const queryClient = useQueryClient();
  const { mutate } = useDeleteBlog({
    onSuccess: (body) => {
      toast.success("Success", {
        description: body.message,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.blogs"] });
    },
  });

  const handleDelete = (data: PostDelete) => {
    mutate(data);
  };
  return (
    <div className="flex flex-col space-y-6">
      <LoadingState data={!isLoading} loadingFallback={<AdminBlogsSkeleton />}>
        {/* <SearchProject
          projects={data?.data}
          onSearchResults={handleSearchResults}
        /> */}
        <div className="grid grid-rows-1 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((item: Post) => (
            <AdminBlogsCard post={item} key={item.id} onDelete={handleDelete} />
          ))}
        </div>
        <Button asChild>
          <Link href="/admin/blogs/create">Create Blog</Link>
        </Button>
      </LoadingState>
    </div>
  );
}
