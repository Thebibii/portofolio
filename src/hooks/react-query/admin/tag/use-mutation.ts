import { baseURL } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
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

          throw new Error(getErrorMessage(errors.error, "Gagal membuat tag"));
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal membuat tag"));
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

          throw new Error(
            getErrorMessage(data.error, "Gagal memperbarui tag")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal memperbarui tag"));
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

          throw new Error(getErrorMessage(data.error, "Gagal menghapus tag"));
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal menghapus tag"));
      }
    },
    onSuccess,
    onError,
  });
};
