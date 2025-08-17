import { Project } from "@prisma/client";
import ProjectCard from "./project-card";
import Link from "next/link";

export default function FeaturedSection({ data }: { data: Project[] }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 xl:px-0 font-mono">
      <section className="space-y-6 pt-9 pb-10 lg:pt-12 w-full">
        <header className="space-y-4">
          <h1 className="font-bold tracking-tight font-mono text-5xl">
            Featured{" "}
            <span className="underline-offset-1 underline">Projects</span>
          </h1>
          <p className="text-neutral-500 italic">
            Core projects with ongoing attention and long-term goals.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <ProjectCard data={data} />
        </div>
        <Link
          href="/projects"
          className="text-lg text-destructive self-end items-end justify-end inline-flex w-full mt-6"
        >
          View all projects
        </Link>
      </section>
      <section className="lg:py-24 pt-9 space-y-6">
        <header className="space-y-4">
          <h1 className="font-bold tracking-tight font-mono text-5xl">
            Featured <span className="underline-offset-1 underline">Posts</span>
          </h1>
          <p className="text-neutral-500 italic">
            Core projects with ongoing attention and long-term goals.
          </p>
        </header>
      </section>
    </div>
  );
}
