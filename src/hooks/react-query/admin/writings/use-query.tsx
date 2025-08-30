import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAdminWritings = () => {
  return useQuery({
    queryKey: ["get.admin.writings"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/writings`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch writings");
      return data;
    },
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
