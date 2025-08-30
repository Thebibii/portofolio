"use client";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGuestProjectBySlug } from "@/hooks/react-query/guest/projects/use-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { data, isError, error, isLoading } = useGuestProjectBySlug({
    slug: params.slug,
  });
  if (isError && error) {
    toast.error("Gagal memuat data", {
      description: error.message,
      id: "project-error", // Prevent duplicate toasts
    });
  }
  return (
    <div className="space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      {/* Project content */}
      <article className="space-y-4 font-mono">
        <h1 className="text-4xl font-bold">{data?.data?.title}</h1>

        {/* Technologies */}
        <div className="flex" aria-label="Technologies used">
          {data?.data?.technologies.map((item: any) => (
            <Badge variant={"secondary"} className="bg-gray-200/60" key={item}>
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
            <span>{data?.data?.views} views</span>
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
      {data?.data?.longDescription && (
        <article
          dangerouslySetInnerHTML={{ __html: data.data.longDescription }}
        />
      )}
    </div>
  );
}
