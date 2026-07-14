import { baseURL } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useIncrementProjectView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["guest.increment.project.view"],
    mutationFn: async (slug: string) => {
      const res = await fetch(`${baseURL}/guest/projects/${slug}/view`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to increment view");
      return res.json();
    },
    onSuccess: (result, slug) => {
      if (result?.success) {
        queryClient.setQueryData(["get.guest.projects", slug], (old: any) => {
          if (!old?.data) return old;
          return { ...old, data: { ...old.data, views: result.data.views } };
        });
      }
    },
  });
};
