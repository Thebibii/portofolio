import ProjectCard from "./project-card";
import Link from "next/link";
import BlogsCard from "./blogs-card";
import LoadingState from "../state/loading-state";
import { BlogsCardSkeleton } from "../skeleton/blogs-card-skeleton";
import ProjectCardSkeleton from "../skeleton/project-card-skeleton";
import { CardTitle } from "@/components/ui/card";

export default function FeaturedSection({
  data,
  isLoadingError,
}: {
  data: any;
  isLoadingError: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 xl:px-0 font-mono">
      <section className="space-y-6 pt-9 pb-10 lg:pt-12 w-full">
        <header className="space-y-4">
          <h1 className="h1">
            Featured{" "}
            <span className="underline-offset-1 underline">Projects</span>
          </h1>
          <p className="text-neutral-500 italic">
            Core projects with ongoing attention and long-term goals.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <LoadingState
            data={isLoadingError}
            loadingFallback={<ProjectCardSkeleton />}
          >
            <ProjectCard data={data?.projects} />
          </LoadingState>
        </div>
        <Link
          href="/projects"
          className="text-lg text-destructive self-end items-end justify-end inline-flex w-full mt-6"
        >
          View all projects
        </Link>
      </section>
      <section className="lg:py-24 py-10 space-y-6">
        <header className="space-y-4">
          <h1 className="font-bold tracking-tight font-mono text-4xl sm:text-5xl">
            Featured <span className="underline-offset-1 underline">Posts</span>
          </h1>
          <p className="text-neutral-500 italic ">
            Core projects with ongoing attention and long-term goals.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-6">
          <LoadingState
            data={isLoadingError}
            loadingFallback={<BlogsCardSkeleton />}
          >
            <BlogsCard to="blogs" data={data?.blogs} />
          </LoadingState>
        </div>
        <Link
          href="/blogs"
          className="text-lg text-destructive self-end items-end justify-end inline-flex w-full mt-6"
        >
          View all blogs
        </Link>
      </section>
    </div>
  );
}
