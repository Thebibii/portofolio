import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAdminBlogs = () => {
  return useQuery({
    queryKey: ["get.admin.blogs"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/blogs`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return data;
    },
  });
};

export const useAdminBlogBySlug = ({ slug }: { slug: string }) => {
  return useQuery({
    queryKey: ["get.admin.blogs", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/blogs/${slug}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return data;
    },
  });
};
