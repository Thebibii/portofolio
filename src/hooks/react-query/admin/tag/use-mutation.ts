import { baseURL } from "@/lib/api";
import { APIResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";

export interface TagFormData {
  name: string;
  color?: string;
}

export const useCreateTag = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.create.tag"],
    mutationFn: async (body: TagFormData) => {
      try {
        const res = await fetch(`${baseURL}/admin/tag`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errors = await res.json().catch(() => ({}));

          throw new Error(errors.error || "Gagal membuat tag");
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

export const useUpdateTag = ({
  id,
  onSuccess,
  onError,
}: {
  id: string;
  onSuccess: (body: APIResponse) => void;
  onError?: (body: any) => void;
}) => {
  console.log(id);

  return useMutation({
    mutationKey: ["update.admin.tag", id],
    mutationFn: async (body: TagFormData) => {
      try {
        const res = await fetch(`${baseURL}/admin/tag/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(data.message || "Gagal mengedit tag");
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

export const useDeleteTag = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["delete.admin.tag"],
    mutationFn: async (body: { id: string }) => {
      try {
        const res = await fetch(`${baseURL}/admin/tag/${body.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(data.message || "Gagal membuat tag");
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
