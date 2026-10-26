import { baseURL } from "@/lib/api";
import { createHttpError, getErrorMessage } from "@/lib/errors";
import type { APIResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";

// Shared by blogs and writings: toggling `featured` always goes through the
// same `/admin/posts/:slug/featured` endpoint, so this hook is not part of the
// per-type factory.
export const useToggleFeaturedPost = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<{ title: string }>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.toggle.featured.post"],
    mutationFn: async ({
      slug,
      featured,
    }: {
      slug: string;
      featured: boolean;
    }) => {
      const res = await fetch(`${baseURL}/admin/posts/${slug}/featured`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw createHttpError(
          getErrorMessage(data.error, "Gagal mengubah status featured"),
          res.status
        );
      }

      return res.json();
    },
    onSuccess,
    onError,
  });
};
