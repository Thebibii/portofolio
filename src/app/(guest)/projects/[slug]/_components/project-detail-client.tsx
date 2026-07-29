"use client";

import { Icons } from "@/components/icons";
import { DisplayPlate } from "@/components/reusable/display-plate";
import GiscusComments from "@/components/reusable/giscus-comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIncrementProjectView } from "@/hooks/react-query/guest/projects/use-mutation";
import { useGuestProjectBySlug } from "@/hooks/react-query/guest/projects/use-query";
import { ArrowLeft, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectData = {
  title: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  image: string | null;
  images: string[];
  technologies: string[];
  demoUrl: string | null;
  sourceUrl: string | null;
  status: string;
  featured: boolean;
  views: number;
  startDate: string | null;
  endDate: string | null;
  updatedAt: string;
};

type Props = {
  project: ProjectData;
  slug: string;
};

export default function ProjectDetailClient({ project, slug }: Props) {
  const { mutateAsync: incrementView } = useIncrementProjectView();

  const { data: projectResponse } = useGuestProjectBySlug(
    { slug },
    { data: project }
  );
  const projectData = projectResponse?.data ?? project;

  const [liveViews, setLiveViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (slug) {
      incrementView(slug).then((result) => {
        if (!cancelled && result?.success) {
          setLiveViews(result.data.views);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [slug, incrementView]);

  return (
    <div className="flex flex-col space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <Link
        href="/projects"
        className="inline-flex justify-end items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-mono"
      >
        <ArrowLeft className="size-4" />
        Kembali ke projek
      </Link>

      <article className="space-y-4 font-mono">
        <h1 className="text-4xl font-bold">{project.title}</h1>

        <div className="flex flex-wrap gap-2" aria-label="Teknologi yang digunakan">
          {project.technologies.map((item: string) => (
            <Badge
              variant="secondary"
              className="bg-gray-200/60"
              key={item}
            >
              {item}
            </Badge>
          ))}
        </div>

        <p>{project.description}</p>

        <Separator orientation="horizontal" />

        <div
          className="flex items-center gap-5 flex-wrap"
          aria-label="Statistik dan tautan"
        >
          <p className="flex text-xs items-center gap-2 mr-auto">
            <Icons.Eye className="size-4" />
            <span>{liveViews ?? "--"} dilihat</span>
          </p>

          {project.demoUrl && (
            <Link
              href={project.demoUrl}
              target="_blank"
              className="flex text-xs items-center gap-2 hover:underline"
              aria-label="Tautan demo projek"
            >
              <Icons.Link className="size-4" />
              <span>Demo</span>
            </Link>
          )}

          {project.sourceUrl && (
            <Link
              href={project.sourceUrl}
              target="_blank"
              className="flex text-xs items-center gap-2 hover:underline"
              aria-label="Tautan repositori"
            >
              <Icons.Github className="size-4" />
              <span>Repositori</span>
            </Link>
          )}
        </div>

        <Separator orientation="horizontal" />
      </article>

      {project.longDescription && <DisplayPlate value={project.longDescription} />}

      <GiscusComments />
    </div>
  );
}
