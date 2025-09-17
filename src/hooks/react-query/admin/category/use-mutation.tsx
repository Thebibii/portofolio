import { baseURL } from "@/lib/api";
import { APIResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";

export interface TagFormData {
  name: string;
  color?: string;
}

export const useCreateCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
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

          throw new Error(errors.error || "Gagal membuat category");
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

export const useUpdateCategory = ({
  id,
  onSuccess,
  onError,
}: {
  id: string;
  onSuccess: (body: APIResponse) => void;
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

          throw new Error(data.message || "Gagal mengedit category");
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

export const useDeleteCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
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

          throw new Error(data.message || "Gagal membuat category");
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
