import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGuestCategory = (type: string, initialData?: any) => {
  return useQuery({
    queryKey: ["get.guest.category", type],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/category?type=${type}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch category");
      return data;
    },
    initialData,
    refetchOnWindowFocus: false,
  });
};
