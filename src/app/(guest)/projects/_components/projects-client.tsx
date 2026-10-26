"use client";
import ProjectCard from "@/components/reusable/home/project-card";
import EmptyState from "@/components/reusable/state/empty-state";
import { EmptyProjects } from "@/components/reusable/state/empty-presets";
import { Rocket, Archive } from "lucide-react";

type Props = {
  featured: any[];
  other: any[];
};

export default function ProjectsClient({ featured, other }: Props) {
  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <section className=" space-y-6 pb-10">
        <header className="space-y-4">
          <h1 className="h1">Projek Utama</h1>
          <p className="text-muted-foreground">
            Projek unggulan dengan perhatian penuh dan tujuan jangka panjang.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <EmptyState
            data={featured}
            emptyFallback={
              <EmptyProjects
                icon={Rocket}
                title="Belum ada projek unggulan"
                description="Nanti lagi ya."
                className="col-span-full"
              />
            }
          >
            <ProjectCard data={featured} />
          </EmptyState>
        </div>
      </section>
      <section className="lg:py-24 pt-9 space-y-6">
        <header className="space-y-4">
          <h1 className="h1">Projek Lainnya</h1>
          <p className="text-muted-foreground">
            Projek sampingan, eksperimen, dan build sebelumnya.
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
          <EmptyState
            data={other}
            emptyFallback={
              <EmptyProjects
                icon={Archive}
                title="Belum ada projek lain"
                description="Nanti lagi ya."
                className="col-span-full"
              />
            }
          >
            <ProjectCard data={other} />
          </EmptyState>
        </div>
      </section>
    </div>
  );
}
