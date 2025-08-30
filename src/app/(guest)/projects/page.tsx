"use client";
import ProjectCard from "@/components/reusable/home/project-card";
import ProjectCardSkeleton from "@/components/reusable/skeleton/project-card-skeleton";
import LoadingState from "@/components/reusable/state/loading-state";
import { useGetGuestProjects } from "@/hooks/react-query/guest/projects/use-query";
import { Project } from "@prisma/client";
import { toast } from "sonner";

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
    <div className="space-y-4 font-mono lg:pt-24 pt-9 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <section className=" space-y-6 pb-10">
        <header className="space-y-4">
          <h1 className="font-bold tracking-tight font-mono text-5xl">
            Main Projects
          </h1>
          <p className="text-muted-foreground">
            Core projects with ongoing attention and long-term goals.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <LoadingState
            data={!isLoading && !isError}
            loadingFallback={<ProjectCardSkeleton />}
          >
            <ProjectCard data={main} />
          </LoadingState>
        </div>
      </section>
      <section className="lg:py-24 pt-9 space-y-6">
        <header className="space-y-4">
          <h1 className="font-bold tracking-tight font-mono text-5xl">
            Other Projects
          </h1>
          <p className="text-muted-foreground">
            Side projects, experiments, and past builds.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <LoadingState
            data={!isLoading && !isError}
            loadingFallback={<ProjectCardSkeleton />}
          >
            <ProjectCard data={other} />
          </LoadingState>
        </div>
      </section>
    </div>
  );
}
