import { baseURL } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { BucketItemData, BucketItemFormData } from "@/types/bucketlist";
import { useMutation } from "@tanstack/react-query";

type SuccessBody = {
  success?: boolean;
  message?: string;
  data?: BucketItemData;
};

export const useCreateBucketItem = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: SuccessBody) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.create.bucketlist"],
    mutationFn: async (body: BucketItemFormData) => {
      const res = await fetch(`${baseURL}/admin/bucketlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          getErrorMessage(data.error, "Gagal menambahkan impian")
        );
      }

      return res.json() as Promise<SuccessBody>;
    },
    onSuccess,
    onError,
  });
};

export const useUpdateBucketItem = ({
  id,
  onSuccess,
  onError,
}: {
  id: string;
  onSuccess: (body: SuccessBody) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.update.bucketlist", id],
    mutationFn: async (body: BucketItemFormData) => {
      const res = await fetch(`${baseURL}/admin/bucketlist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          getErrorMessage(data.error, "Gagal memperbarui impian")
        );
      }

      return res.json() as Promise<SuccessBody>;
    },
    onSuccess,
    onError,
  });
};

export const useDeleteBucketItem = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: SuccessBody) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.delete.bucketlist"],
    mutationFn: async ({ id }: { id: string }) => {
      const res = await fetch(`${baseURL}/admin/bucketlist/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(getErrorMessage(data.error, "Gagal menghapus impian"));
      }

      return res.json() as Promise<SuccessBody>;
    },
    onSuccess,
    onError,
  });
};

export const useReorderBucketItems = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (body: { success?: boolean; message?: string }) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.reorder.bucketlist"],
    mutationFn: async (ids: string[]) => {
      const res = await fetch(`${baseURL}/admin/bucketlist/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(getErrorMessage(data.error, "Gagal mengubah urutan"));
      }

      return res.json();
    },
    onSuccess,
    onError,
  });
};
