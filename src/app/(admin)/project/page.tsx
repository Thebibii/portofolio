"use client";
import { useState, useCallback } from "react";
import CardProject from "@/components/reusable/admin/projects/card-project";
import SearchProject from "@/components/reusable/admin/projects/search-project";
import { AdminProjectsSkeleton } from "@/components/reusable/skeleton/AdminProjectsSkeleton";
import LoadingState from "@/components/reusable/state/loading-state";

import { useAdminProjects } from "@/hooks/react-query/admin/projects/use-query";
import { Project } from "@prisma/client";

export default function Page() {
  const { data, isLoading } = useAdminProjects();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  // Callback to handle search results
  const handleSearchResults = useCallback((results: Project[]) => {
    setFilteredProjects(results);
    setHasFiltered(true);
  }, []);

  // Determine which data to show: filtered results or original data
  const projectsToShow = hasFiltered ? filteredProjects : data?.data;

  return (
    <div className="flex flex-col space-y-6">
      <LoadingState
        data={!isLoading}
        loadingFallback={<AdminProjectsSkeleton />}
      >
        <SearchProject
          projects={data?.data}
          onSearchResults={handleSearchResults}
        />
        <div className="grid grid-rows-1 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <CardProject data={projectsToShow} />
        </div>
      </LoadingState>
    </div>
  );
}
