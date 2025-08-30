import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGuestTags = (type: string) => {
  return useQuery({
    queryKey: ["get.guest.tags", type],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/tags?type=${type}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch tags");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
