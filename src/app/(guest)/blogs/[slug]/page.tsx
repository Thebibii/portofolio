"use client";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGuestBlogBySlug } from "@/hooks/react-query/guest/blogs/use-query";
import { formatCreatedUpdated } from "@/hooks/use-formatted-date";
import Image from "next/image";
import ProfileImage from "../../../../../public/profile.png";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { data } = useGuestBlogBySlug({ slug: params.slug });
  return (
    <div className="space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      {/* Project content */}
      <article className="space-y-4 font-mono">
        {/* Technologies */}
        <div className="flex space-x-2" aria-label="Technologies used">
          {data?.data?.tags?.map(({ tag }: { tag: any }) => (
            <Badge variant={"outline"} key={tag.slug}>
              {tag?.name}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{data?.data?.title}</h1>
          {/* Short description */}
          <p>{data?.data?.excerpt}</p>
        </div>
        <div className="flex gap-3 items-center mt-10">
          <div className="size-10 rounded-full overflow-hidden">
            <figure className="isolate z-[1] overflow-hidden select-none pointer-events-none object-cover">
              <div
                style={{
                  position: "relative",
                  height: 0,
                  paddingTop: "100%",
                  cursor: "default",
                }}
              >
                <div className="jsx-496024066 absolute left-0 top-0">
                  <Image
                    alt="Habibie"
                    title="Habibie"
                    loading="lazy"
                    width={350}
                    height={350}
                    decoding="async"
                    src={ProfileImage}
                  />
                </div>
              </div>
            </figure>
          </div>
          <div>
            <h4 className="text-sm">Habibie Bayezid Wildan</h4>
            <p className="text-xs mt-0.5 text-neutral-600">
              {formatCreatedUpdated(data?.data?.createdAt)}
            </p>
          </div>
        </div>

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
            <span>Likes</span>
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
