import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAdminCategory = () => {
  return useQuery({
    queryKey: ["get.admin.category"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/category`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch category");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
