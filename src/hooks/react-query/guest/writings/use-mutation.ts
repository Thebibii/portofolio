import { baseURL } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useIncrementWritingView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["guest.increment.writing.view"],
    mutationFn: async (slug: string) => {
      const res = await fetch(`${baseURL}/guest/writings/${slug}/view`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to increment view");
      return res.json();
    },
    onSuccess: (result, slug) => {
      if (result?.success) {
        queryClient.setQueryData(["get.guest.writings", slug], (old: any) => {
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

export const useToggleWritingLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["guest.toggle.writing.like"],
    mutationFn: async (slug: string) => {
      const res = await fetch(`${baseURL}/guest/writings/${slug}/like`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json();
    },
    onSuccess: (result, slug) => {
      if (result?.liked !== undefined) {
        queryClient.setQueryData(["get.guest.writings.liked", slug], {
          liked: result.liked,
          likeCount: result.likeCount,
        });
      }
      if (result?.likeCount !== undefined) {
        queryClient.setQueryData(["get.guest.writings", slug], (old: any) => {
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
