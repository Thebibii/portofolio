import { baseURL } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { ProjectFormData } from "@/types/projects";
import { APIResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";

export const useCreateProject = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
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

          throw new Error(
            getErrorMessage(errors.error, "Gagal membuat project")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal membuat project"));
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
  onSuccess: (body: APIResponse) => void;
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

          throw new Error(
            getErrorMessage(data.error, "Gagal menghapus project")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal menghapus project"));
      }
    },
    onSuccess,
    onError,
  });
};

export const useToggleFeaturedProject = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.toggle.featured.project"],
    mutationFn: async ({
      id,
      featured,
    }: {
      id: string;
      featured: boolean;
    }) => {
      try {
        const res = await fetch(`${baseURL}/project/${id}/featured`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ featured }),
        });

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

export const useUpdateProject = ({
  id,
  onSuccess,
  onError,
}: {
  id: string;
  onSuccess: (body: APIResponse) => void;
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

          throw new Error(
            getErrorMessage(data.error, "Gagal memperbarui project")
          );
        }

        return res.json();
      } catch (error) {
        throw new Error(getErrorMessage(error, "Gagal memperbarui project"));
      }
    },
    onSuccess,
    onError,
  });
};
