import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAdminTag = () => {
  return useQuery({
    queryKey: ["get.admin.tag"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/tag`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch tag");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
