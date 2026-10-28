"use client";
import ProjectCard from "./project-card";
import Link from "next/link";
import BlogsCard from "./blogs-card";
import LoadingState from "../state/loading-state";
import EmptyState from "../state/empty-state";
import { EmptyPosts, EmptyProjects } from "../state/empty-presets";
import { BlogsCardSkeleton } from "../skeleton/blogs-card-skeleton";
import ProjectCardSkeleton from "../skeleton/project-card-skeleton";
import { CardTitle } from "@/components/ui/card";
import { Rocket, BookOpen } from "lucide-react";
import { useFeaturedBlogs } from "@/hooks/react-query/guest/featured/use-query";

export default function FeaturedSection({
  data,
  isLoadingError,
}: {
  data: any;
  isLoadingError: boolean;
}) {
  const { data: featuredBlogs } = useFeaturedBlogs(data?.blogs);
  const displayBlogs = featuredBlogs ?? data?.blogs;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 xl:px-0 font-mono">
      <section className="space-y-6 pt-9 pb-10 lg:pt-12 w-full">
        <header className="space-y-4">
          <h2 className="h1">
            Projek{" "}
            <span className="underline-offset-1 underline">Unggulan</span>
          </h2>
          <p className="text-neutral-500 italic">
            Projek unggulan dengan perhatian penuh dan tujuan jangka panjang.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <LoadingState
            data={isLoadingError}
            loadingFallback={<ProjectCardSkeleton />}
          >
            <EmptyState
              data={data?.projects}
              emptyFallback={
                <EmptyProjects
                  icon={Rocket}
                  title="Belum ada projek unggulan"
                  description="Nanti lagi ya."
                  className="col-span-full"
                />
              }
            >
              <ProjectCard data={data?.projects} />
            </EmptyState>
          </LoadingState>
        </div>
        <Link
          href="/projects"
          className="text-lg text-destructive self-end items-end justify-end inline-flex w-full mt-6"
        >
          Lihat semua projek
        </Link>
      </section>
      <section className="lg:py-24 py-10 space-y-6">
        <header className="space-y-4">
          <h2 className="h1">
            Blog             <span className="underline-offset-1 underline">Unggulan</span>
          </h2>
          <p className="text-neutral-500 italic ">
            Artikel dan ide mendalam yang layak dibaca.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-6">
          <LoadingState
            data={isLoadingError}
            loadingFallback={<BlogsCardSkeleton />}
          >
            <EmptyState
              data={displayBlogs}
              emptyFallback={
                <EmptyPosts
                  icon={BookOpen}
                  title="Belum ada blog unggulan"
                  description="Nanti lagi ya."
                  className="col-span-full"
                />
              }
            >
              <BlogsCard to="blogs" data={displayBlogs} />
            </EmptyState>
          </LoadingState>
        </div>
        <Link
          href="/blogs"
          className="text-lg text-destructive self-end items-end justify-end inline-flex w-full mt-6"
        >
          Lihat semua blog
        </Link>
      </section>
    </div>
  );
}
