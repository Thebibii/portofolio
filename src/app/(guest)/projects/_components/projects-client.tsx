"use client";
import ProjectCard from "@/components/reusable/home/project-card";
import EmptyState from "@/components/reusable/state/empty-state";
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
              <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
                <Rocket className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold">Belum ada projek unggulan</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Nanti lagi ya.
                </p>
              </div>
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
              <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
                <Archive className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold">Belum ada projek lain</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Nanti lagi ya.
                </p>
              </div>
            }
          >
            <ProjectCard data={other} />
          </EmptyState>
        </div>
      </section>
    </div>
  );
}
