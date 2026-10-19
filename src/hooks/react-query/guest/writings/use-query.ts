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

export const useGetGuestWritings = (filters?: WritingFilters, initialData?: any) => {
  return useQuery({
    queryKey: ["get.guest.writings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.tag) params.append("tag", filters.tag);
      if (filters?.category) params.append("category", filters.category);
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
    initialData,
    refetchOnWindowFocus: false,
  });
};

export const useWritingLikeStatus = (slug: string) => {
  return useQuery({
    queryKey: ["get.guest.writings.liked", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/writings/${slug}/like`);
      if (!res.ok) throw new Error("Failed to fetch like status");
      return res.json();
    },
    retry: false,
  });
};

export const useGuestWritingBySlug = (
  { slug }: { slug: string },
  initialData?: any
) => {
  return useQuery({
    queryKey: ["get.guest.writings", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/writings/${slug}`);

      const data = await res.json();

      if (!res.ok) {
        const error: any = new Error(
          data.message || "Failed to fetch writings"
        );
        error.status = res.status;
        throw error;
      }

      return data;
    },
    initialData,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });
};
