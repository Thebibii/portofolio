"use client";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGuestBlogBySlug } from "@/hooks/react-query/guest/blogs/use-query";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { data } = useGuestBlogBySlug({ slug: params.slug });
  return (
    <div className="space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      {/* Project content */}
      <article className="space-y-4 font-mono">
        <h1 className="text-4xl font-bold">{data?.data?.title}</h1>

        {/* Technologies */}
        <div className="flex" aria-label="Technologies used">
          {data?.data?.tags?.map(({ tag }: { tag: any }) => (
            <Badge variant={"outline"} key={tag.slug}>
              {tag?.name}
            </Badge>
          ))}
        </div>

        {/* Short description */}
        <p>{data?.data?.excerpt}</p>

        <Separator orientation="horizontal" />

        {/* Views and links */}
        <div
          className="flex items-center gap-5 flex-wrap"
          aria-label="Project stats and links"
        >
          {/* Views */}
          <p className="flex text-xs items-center gap-2 mr-auto">
            <Icons.Eye className="size-4" />
            <span>{data?.data?.viewCount} views</span>
          </p>

          {/* Demo link */}
          <p
            // href={data?.data?.demoUrl}
            className="flex text-xs items-center gap-2"
            aria-label="Link to project demo"
          >
            <Icons.BookOpen className="size-4" />
            <span>{data?.data?.readingTime} min read</span>
          </p>

          {/* Repository link */}
          <p
            className="flex text-xs items-center gap-2"
            aria-label="Link to project repository"
          >
            <Icons.Heart className="size-4" />
            <span>Repository</span>
          </p>
        </div>

        <Separator orientation="horizontal" />
      </article>

      {/* Long description */}
      {data?.data?.content && (
        <article dangerouslySetInnerHTML={{ __html: data.data.content }} />
      )}
    </div>
  );
}
