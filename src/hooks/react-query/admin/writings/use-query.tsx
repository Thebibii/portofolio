import { baseURL } from "@/lib/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface AdminWritingsFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  tagId?: string;
}

export const useAdminWritings = (filters: AdminWritingsFilters = {}) => {
  const { page = 1, limit = 15, search, status, categoryId, tagId } = filters;

  return useQuery({
    // Prefix "get.admin.writings" lets invalidateQueries({ queryKey: ["get.admin.writings"] })
    // still match every page/filter combination (partial key matching).
    queryKey: [
      "get.admin.writings",
      { page, limit, search, status, categoryId, tagId },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      // Only include filter params when set — never send empty strings / "all".
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (categoryId) params.set("categoryId", categoryId);
      if (tagId) params.set("tagId", tagId);

      const res = await fetch(`${baseURL}/admin/writings?${params.toString()}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch writings");
      return data;
    },
    // Keep the previous page/filter data visible while the next one loads.
    placeholderData: keepPreviousData,
  });
};

export const useAdminWritingBySlug = ({ slug }: { slug: string }) => {
  return useQuery({
    queryKey: ["get.admin.writings", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/writings/${slug}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch writings");
      return data;
    },
  });
};
