import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGuestTags = () => {
  return useQuery({
    queryKey: ["get.guest.tags"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/tags`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch tags");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
