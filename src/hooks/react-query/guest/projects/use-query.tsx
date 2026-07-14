import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetGuestProjects = (featured?: boolean) => {
  return useQuery({
    queryKey:
      featured !== undefined
        ? ["get.guest.projects", "filtered", featured]
        : ["get.guest.projects"],
    queryFn: async () => {
      const params = featured !== undefined ? `?featured=${featured}` : "";
      const res = await fetch(`${baseURL}/guest/projects${params}`);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
};

export const useGuestProjectBySlug = ({ slug }: { slug: string }) => {
  return useQuery({
    queryKey: ["get.guest.projects", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/projects/${slug}`);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
};
