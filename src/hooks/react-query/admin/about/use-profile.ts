import { baseURL } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { qk } from "@/lib/react-query/keys";
import { APIResponse } from "@/types/response";
import { AboutProfileInput } from "@/types/validation/about";
import { AboutProfile } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAdminAboutProfile = () => {
  return useQuery({
    queryKey: qk.admin.aboutProfile,
    queryFn: async () => {
      try {
        const res = await fetch(`${baseURL}/admin/about/profile`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            getErrorMessage(data.error, "Gagal memuat profil about")
          );
        }

        return data as APIResponse<AboutProfile | null>;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, "Gagal memuat profil about")
        );
      }
    },
  });
};

export const useUpdateAboutProfile = ({
  onSuccess,
  onError,
}: {
  onSuccess: (body: APIResponse<AboutProfile>) => void;
  onError?: (body: any) => void;
}) => {
  return useMutation({
    mutationKey: ["admin.update.about-profile"],
    mutationFn: async (body: AboutProfileInput) => {
      try {
        const res = await fetch(`${baseURL}/admin/about/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errors = await res.json().catch(() => ({}));

          throw new Error(
            getErrorMessage(errors.error, "Gagal menyimpan profil about")
          );
        }

        return res.json() as Promise<APIResponse<AboutProfile>>;
      } catch (error) {
        throw new Error(
          getErrorMessage(error, "Gagal menyimpan profil about")
        );
      }
    },
    onSuccess,
    onError,
  });
};
