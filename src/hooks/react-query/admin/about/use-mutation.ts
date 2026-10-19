import { baseURL } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { APIResponse } from "@/types/response";
import { CurrentActivity, Experience } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

export const useUpsertExperiences = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<Experience[]>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.upsert.experience"],
    mutationFn: async (body: Experience) => {
      try {
        const res = await fetch(`${baseURL}/admin/about/experiences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errors = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(errors.error, "Gagal menambahkan pengalaman")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(
          getErrorMessage(error, "Gagal menambahkan pengalaman")
        );
      }
    },
    onSuccess,
    onError,
  });
};

export const useDeleteExperience = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<{ id: number }>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.delete.experience"],
    mutationFn: async (body: { id: string }) => {
      try {
        const res = await fetch(
          `${baseURL}/admin/about/experiences/${body.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(data.error, "Gagal menghapus pengalaman")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal menghapus pengalaman"));
      }
    },
    onSuccess,
    onError,
  });
};

export const useUpsertCurrentActivity = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<CurrentActivity[]>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.upsert.current-activity"],
    mutationFn: async (body: Experience) => {
      try {
        const res = await fetch(`${baseURL}/admin/about/current-activities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errors = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(errors.error, "Gagal menambahkan aktivitas saat ini")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(
          getErrorMessage(error, "Gagal menambahkan aktivitas saat ini")
        );
      }
    },
    onSuccess,
    onError,
  });
};

export const useDeleteCurrentActivity = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<{ id: number }>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.delete.current-activity"],
    mutationFn: async (body: { id: string }) => {
      try {
        const res = await fetch(
          `${baseURL}/admin/about/current-activities/${body.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(data.error, "Gagal menghapus aktivitas saat ini")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(
          getErrorMessage(error, "Gagal menghapus aktivitas saat ini")
        );
      }
    },
    onSuccess,
    onError,
  });
};
