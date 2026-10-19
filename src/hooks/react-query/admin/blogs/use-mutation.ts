import { baseURL } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Post, PostDelete } from "@/types/blogs";
import { ProjectFormData } from "@/types/projects";
import { APIResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";

export const useCreateBlog = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.create.blog"],
    mutationFn: async (body: Post) => {
      try {
        const res = await fetch(`${baseURL}/admin/blogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errors = await res.json().catch(() => ({}));

          throw new Error(getErrorMessage(errors.error, "Gagal membuat blog"));
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal membuat blog"));
      }
    },
    onSuccess,
    onError,
  });
};

export const useDeleteBlog = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.delete.blog"],
    mutationFn: async (body: PostDelete) => {
      try {
        const res = await fetch(`${baseURL}/admin/blogs/${body.slug}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body.slug),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(getErrorMessage(data.error, "Gagal menghapus blog"));
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal menghapus blog"));
      }
    },
    onSuccess,
    onError,
  });
};

export const useToggleFeaturedPost = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
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
      try {
        const res = await fetch(
          `${baseURL}/admin/posts/${slug}/featured`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ featured }),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            getErrorMessage(data.error, "Gagal mengubah status featured")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(
          getErrorMessage(error, "Gagal mengubah status featured")
        );
      }
    },
    onSuccess,
    onError,
  });
};

export const useUpdateBlog = ({
  slug,
  onSuccess,
  onError,
}: {
  slug: string;
  onSuccess: (body: APIResponse) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.update.blog", slug],
    mutationFn: async (body: Post) => {
      try {
        const res = await fetch(`${baseURL}/admin/blogs/${slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(getErrorMessage(data.error, "Gagal memperbarui blog"));
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal memperbarui blog"));
      }
    },
    onSuccess,
    onError,
  });
};
