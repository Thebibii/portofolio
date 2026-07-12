"use client";
import { useState, useCallback } from "react";
import { AdminProjectsSkeleton } from "@/components/reusable/skeleton/AdminProjectsSkeleton";
import EmptyState from "@/components/reusable/state/empty-state";
import LoadingState from "@/components/reusable/state/loading-state";

import { useAdminProjects } from "@/hooks/react-query/admin/projects/use-query";
import { useDeleteProject, useToggleFeaturedProject } from "@/hooks/react-query/admin/projects/use-mutation";
import { Project } from "@prisma/client";
import AdminProjectCard from "@/components/reusable/admin/projects/admin-project-card";
import SearchProject from "@/components/reusable/admin/projects/search-project";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const { data, isLoading } = useAdminProjects();
  const queryClient = useQueryClient();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const { mutate: deleteProject } = useDeleteProject({
    onSuccess: (body) => {
      toast.success("Success", {
        description: body.message,
      });
      queryClient.invalidateQueries({ queryKey: ["get.admin.projects"] });
    },
  });

  const { mutate: toggleFeatured } = useToggleFeaturedProject({
    onSuccess: (body) => {
      toast.success(body.message);
      queryClient.invalidateQueries({ queryKey: ["get.admin.projects"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Gagal mengubah featured status");
    },
  });

  const handleDelete = (data: { id: string; title: string }) => {
    deleteProject({ id: data.id });
  };

  const handleToggleFeatured = (project: Project) => {
    toggleFeatured({ id: project.id, featured: !project.featured });
  };

  const handleSearchResults = useCallback((results: Project[]) => {
    setFilteredProjects(results);
    setHasFiltered(true);
  }, []);

  const projectsToShow = hasFiltered ? filteredProjects : data?.data;

  return (
    <div className="flex flex-col space-y-6">
      <LoadingState
        data={!isLoading}
        loadingFallback={<AdminProjectsSkeleton />}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Projects</h2>
        </div>

        <SearchProject
          projects={data?.data}
          onSearchResults={handleSearchResults}
        />
        <EmptyState
          data={projectsToShow}
          emptyFallback={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Folder className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No projects yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Get started by creating your first project.
              </p>
              <Button asChild>
                <Link href="/admin/project/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first project
                </Link>
              </Button>
            </div>
          }
        >
          <div className="grid grid-rows-1 gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {projectsToShow?.map((item: Project) => (
              <AdminProjectCard
                key={item.id}
                data={item}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        </EmptyState>
      </LoadingState>
    </div>
  );
}
