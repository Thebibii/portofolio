"use client";

import { Icons } from "@/components/icons";
import { DisplayPlate } from "@/components/reusable/display-plate";
import ProjectDetailsSkeleton from "@/components/reusable/skeleton/project-detail-skeleton";
import EmptyState from "@/components/reusable/state/empty-state";
import LoadingState from "@/components/reusable/state/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGuestProjectBySlug } from "@/hooks/react-query/guest/projects/use-query";
import { useIncrementProjectView } from "@/hooks/react-query/guest/projects/use-mutation";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { data, isError, error, isLoading } = useGuestProjectBySlug({
    slug: params.slug,
  });

  const { mutate: incrementView } = useIncrementProjectView();

  useEffect(() => {
    if (params.slug) incrementView(params.slug);
  }, [params.slug, incrementView]);
  if (isError && error) {
    toast.error("Gagal memuat data", {
      description: error.message,
      id: "project-error",
    });
  }
  return (
    <LoadingState
      data={!isLoading}
      loadingFallback={<ProjectDetailsSkeleton />}
    >
      {!isError && (
        <EmptyState
          data={data?.data ? [data.data] : undefined}
          emptyFallback={
            <div className="flex flex-col items-center justify-center py-32 text-center font-mono">
              <FolderOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold">Project not found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                The project you&apos;re looking for doesn&apos;t exist.
              </p>
              <Button asChild>
                <Link href="/projects">&larr; Back to projects</Link>
              </Button>
            </div>
          }
        >
          <div className="flex flex-col space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
            <Link
              href="/projects"
              className="inline-flex justify-end items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-mono"
            >
              &larr; Back to projects
            </Link>

            {/* Project content */}
            <article className="space-y-4 font-mono">
              <h1 className="text-4xl font-bold">{data?.data?.title}</h1>

              {/* Technologies */}
              <div className="flex gap-2" aria-label="Technologies used">
                {data?.data?.technologies.map((item: any) => (
                  <Badge
                    variant={"secondary"}
                    className="bg-gray-200/60"
                    key={item}
                  >
                    {item}
                  </Badge>
                ))}
              </div>

              {/* Short description */}
              <p>{data?.data?.description}</p>

              <Separator orientation="horizontal" />

              {/* Views and links */}
              <div
                className="flex items-center gap-5 flex-wrap"
                aria-label="Project stats and links"
              >
                {/* Views */}
                <p className="flex text-xs items-center gap-2 mr-auto">
                  <Icons.Eye className="size-4" />
                  <span>{data?.data?.views ?? "--"} views</span>
                </p>

                {/* Demo link */}
                {data?.data?.demoUrl && (
                  <Link
                    href={data?.data?.demoUrl}
                    target="_blank"
                    className="flex text-xs items-center gap-2 hover:underline"
                    aria-label="Link to project demo"
                  >
                    <Icons.Link className="size-4" />
                    <span>Link demo</span>
                  </Link>
                )}

                {/* Repository link */}
                {data?.data?.sourceUrl && (
                  <Link
                    href={data?.data?.sourceUrl}
                    target="_blank"
                    className="flex text-xs items-center gap-2 hover:underline"
                    aria-label="Link to project repository"
                  >
                    <Icons.Github className="size-4" />
                    <span>Repository</span>
                  </Link>
                )}
              </div>

              <Separator orientation="horizontal" />
            </article>

            {/* Long description */}
            <DisplayPlate value={data?.data?.longDescription} />
          </div>
        </EmptyState>
      )}
    </LoadingState>
  );
}
