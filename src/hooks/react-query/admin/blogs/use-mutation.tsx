import { baseURL } from "@/lib/api";
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

          throw new Error(errors.error || "Gagal membuat blogs");
        }

        return res.json();
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Terjadi kesalahan"
        );
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

          throw new Error(data.message || "Gagal menghapus blog");
        }

        return res.json();
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Terjadi kesalahan"
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

          throw new Error(data.message || "Gagal mengedit slug");
        }

        return res.json();
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Terjadi kesalahan"
        );
      }
    },
    onSuccess,
    onError,
  });
};
