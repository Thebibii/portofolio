import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetGuestProjects = () => {
  return useQuery({
    queryKey: ["get.guest.projects"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/projects`);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
};

export const useGuestProjectBySlug = ({ slug }: { slug: string }) => {
  return useQuery({
    queryKey: ["get.guest.blogs", slug],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/projects/${slug}`);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
};
