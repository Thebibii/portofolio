"use client";
import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useFeaturedBlogs = (initialData?: any) => {
  return useQuery({
    queryKey: ["get.guest.featured.blogs"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/featured/blogs`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data;
    },
    initialData,
    staleTime: 5 * 60 * 1000,
  });
};
