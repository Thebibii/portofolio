import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["get.admin.dashboard"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return data;
    },
  });
};
