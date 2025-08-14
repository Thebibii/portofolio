import { baseURL } from "@/lib/api";
import { ProjectFormData } from "@/types/projects";
import { useMutation } from "@tanstack/react-query";

export const useCreateProject = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: any) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.create.project"],
    mutationFn: async (body: ProjectFormData) => {
      try {
        const res = await fetch(`${baseURL}/project`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errors = await res.json().catch(() => ({}));

          throw new Error(errors.error || "Gagal membuat project");
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

export const useDeleteProject = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: any) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.delete.project"],
    mutationFn: async (body: { id: string }) => {
      try {
        const res = await fetch(`${baseURL}/project/${body.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(data.message || "Gagal membuat project");
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

export const useUpdateProject = ({
  id,
  onSuccess,
  onError,
}: {
  id: string;
  onSuccess: (body: any) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.update.project", id],
    mutationFn: async (body: ProjectFormData) => {
      try {
        const res = await fetch(`${baseURL}/project/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          throw new Error(data.message || "Gagal mengedit project");
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
