import { Project } from "@prisma/client";
import ProjectCard from "./project-card";
import Link from "next/link";

export default function FeaturedSection({ data }: { data: Project[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 xl:px-0 font-mono">
      <article className="space-y-4 pt-9 pb-10 lg:pt-12 w-full">
        <h1 className="font-bold tracking-tight font-mono text-5xl">
          Featured{" "}
          <span className="underline-offset-1 underline">Projects</span>
        </h1>
        <p className="text-neutral-500 italic">
          Core projects with ongoing attention and long-term goals.
        </p>

        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <ProjectCard data={data} />
        </div>
        <div className="self-end items-end justify-end inline-flex w-full mt-6">
          <Link href="#" className="text-lg text-destructive">
            View all projects
          </Link>
        </div>
      </article>
      <article className="space-y-4 pt-9 pb-10 lg:pt-12 w-full">
        <h1 className="font-bold tracking-tight font-mono text-5xl">
          Featured <span className="underline-offset-1 underline">Posts</span>
        </h1>
        <p className="text-neutral-500 italic">
          Core projects with ongoing attention and long-term goals.
        </p>
      </article>
    </section>
  );
}
