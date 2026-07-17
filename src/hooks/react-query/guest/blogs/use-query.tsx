import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface BlogFilters {
  search?: string;
  tag?: string;
  category?: string; // Add this line
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useGetGuestBlogs = (filters?: BlogFilters, initialData?: any) => {
  return useQuery({
    queryKey: ["get.guest.blogs", filters],
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
      const url = `${baseURL}/guest/blogs${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to fetch blogs");
      return data;
    },
    initialData,
    refetchOnWindowFocus: false,
  });
};

export const useBlogLikeStatus = (slug: string) => {
  return useQuery({
    queryKey: ["get.guest.blogs.liked", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/blogs/${slug}/like`);
      if (!res.ok) throw new Error("Failed to fetch like status");
      return res.json();
    },
    retry: false,
  });
};

export const useGuestBlogBySlug = ({ slug }: { slug: string }) => {
  return useQuery({
    queryKey: ["get.guest.blogs", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/blogs/${slug}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return data;
    },
  });
};
