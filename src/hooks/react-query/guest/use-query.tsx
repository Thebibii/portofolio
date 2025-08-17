import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetDataHome = () => {
  return useQuery({
    queryKey: ["get.guest"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch tag");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
