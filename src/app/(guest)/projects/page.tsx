"use client";
import ProjectCard from "@/components/reusable/home/project-card";
import ProjectCardSkeleton from "@/components/reusable/skeleton/project-card-skeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import EmptyState from "@/components/reusable/state/empty-state";
import { useGetGuestProjects } from "@/hooks/react-query/guest/projects/use-query";
import { Project } from "@prisma/client";
import { toast } from "sonner";
import { Rocket, Archive } from "lucide-react";

export default function Page() {
  const { data, isLoading, isError, error } = useGetGuestProjects();

  const main = data?.data?.filter((item: Project) => item.featured === true);

  const other = data?.data?.filter((item: Project) => item.featured === false);
  if (isError && error) {
    toast.error("Gagal memuat data", {
      description: error.message,
      id: "projects-error", // Prevent duplicate toasts
    });
  }
  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <section className=" space-y-6 pb-10">
        <header className="space-y-4">
          <h1 className="h1">Main Projects</h1>
          <p className="text-muted-foreground">
            Core projects with ongoing attention and long-term goals.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <LoadingState
            data={!isLoading && !isError}
            loadingFallback={<ProjectCardSkeleton />}
          >
            <EmptyState
              data={main}
              emptyFallback={
                <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
                  <Rocket className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <h3 className="font-semibold">No featured projects</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later.
                  </p>
                </div>
              }
            >
              <ProjectCard data={main} />
            </EmptyState>
          </LoadingState>
        </div>
      </section>
      <section className="lg:py-24 pt-9 space-y-6">
        <header className="space-y-4">
          <h1 className="h1">Other Projects</h1>
          <p className="text-muted-foreground">
            Side projects, experiments, and past builds.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <LoadingState
            data={!isLoading && !isError}
            loadingFallback={<ProjectCardSkeleton />}
          >
            <EmptyState
              data={other}
              emptyFallback={
                <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
                  <Archive className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <h3 className="font-semibold">No other projects</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later.
                  </p>
                </div>
              }
            >
              <ProjectCard data={other} />
            </EmptyState>
          </LoadingState>
        </div>
      </section>
    </div>
  );
}
