import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface WritingFilters {
  search?: string;
  tag?: string;
  category?: string; // Add this line
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useGetGuestWritings = (filters?: WritingFilters) => {
  return useQuery({
    queryKey: ["get.guest.writings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.tag) params.append("tag", filters.tag);
      if (filters?.category) params.append("category", filters.category); // Add this line
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString();
      const url = `${baseURL}/guest/writings${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to fetch writings");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useGuestWritingBySlug = ({ slug }: { slug: string }) => {
  return useQuery({
    queryKey: ["get.guest.writings", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/writings/${slug}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch writings");
      return data;
    },
  });
};
