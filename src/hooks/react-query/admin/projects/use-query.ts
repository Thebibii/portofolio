import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAdminProjects = () => {
  return useQuery({
    queryKey: ["get.admin.projects"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/project`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch projects");
      return data;
    },
  });
};

export const useAdminProjectById = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["get.admin.project", id],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/project/${id}`);

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch project");
      return data;
    },
  });
};
