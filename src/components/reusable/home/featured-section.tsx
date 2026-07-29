"use client";
import ProjectCard from "./project-card";
import Link from "next/link";
import BlogsCard from "./blogs-card";
import LoadingState from "../state/loading-state";
import EmptyState from "../state/empty-state";
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
          <h1 className="h1">
            Projek{" "}
            <span className="underline-offset-1 underline">Unggulan</span>
          </h1>
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
                <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
                  <Rocket className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <h3 className="font-semibold">Belum ada projek unggulan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nanti lagi ya.
                  </p>
                </div>
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
          <h1 className="font-bold tracking-tight font-mono text-4xl sm:text-5xl">
            Blog             <span className="underline-offset-1 underline">Unggulan</span>
          </h1>
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
                <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
                  <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <h3 className="font-semibold">Belum ada blog unggulan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nanti lagi ya.
                  </p>
                </div>
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
