import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAdminAbout = () => {
  return useQuery({
    queryKey: ["get.admin.about"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/about`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch about");
      return data;
    },
  });
};
