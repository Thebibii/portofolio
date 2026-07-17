import { baseURL } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useIncrementBlogView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["guest.increment.blog.view"],
    mutationFn: async (slug: string) => {
      const res = await fetch(`${baseURL}/guest/blogs/${slug}/view`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to increment view");
      return res.json();
    },
    onSuccess: (result, slug) => {
      if (result?.success) {
        queryClient.setQueryData(["get.guest.blogs", slug], (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: { ...old.data, viewCount: result.data.viewCount },
          };
        });
      }
    },
  });
};

export const useToggleBlogLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["guest.toggle.blog.like"],
    mutationFn: async (slug: string) => {
      const res = await fetch(`${baseURL}/guest/blogs/${slug}/like`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json();
    },
    onSuccess: (result, slug) => {
      queryClient.invalidateQueries({ queryKey: ["get.guest.blogs.liked", slug] });
      if (result?.likeCount !== undefined) {
        queryClient.setQueryData(["get.guest.blogs", slug], (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              _count: { likes: result.likeCount },
            },
          };
        });
      }
    },
  });
};
