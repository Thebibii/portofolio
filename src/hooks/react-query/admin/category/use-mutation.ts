import { baseURL } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { APIResponse } from "@/types/response";
import type { TagFormData } from "@/types/tags";
import { useMutation } from "@tanstack/react-query";

export const useCreateCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<{ name: string }>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.create.category"],
    mutationFn: async (body: TagFormData) => {
      try {
        const res = await fetch(`${baseURL}/admin/category`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errors = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(errors.error, "Gagal membuat category")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal membuat category"));
      }
    },
    onSuccess,
    onError,
  });
};

export const useUpdateCategory = ({
  id,
  onSuccess,
  onError,
}: {
  id: string;
  onSuccess: (body: APIResponse<{ name: string }>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["update.admin.category", id],
    mutationFn: async (body: TagFormData) => {
      try {
        const res = await fetch(`${baseURL}/admin/category/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(data.error, "Gagal memperbarui category")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal memperbarui category"));
      }
    },
    onSuccess,
    onError,
  });
};

export const useDeleteCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<{ id: string; name: string }>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["delete.admin.category"],
    mutationFn: async (body: { id: string }) => {
      try {
        const res = await fetch(`${baseURL}/admin/category/${body.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(data.error, "Gagal menghapus category")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal menghapus category"));
      }
    },
    onSuccess,
    onError,
  });
};
