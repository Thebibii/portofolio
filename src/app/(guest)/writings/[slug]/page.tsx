"use client";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProfileImage from "../../../../../public/profile.png";
import { useGuestWritingBySlug } from "@/hooks/react-query/guest/writings/use-query";
import { formatCreatedUpdated } from "@/hooks/use-formatted-date";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { toast } from "sonner";
import LoadingState from "@/components/reusable/state/loading-state";
import { ArrowLeft } from "lucide-react";
import { useIncrementWritingView } from "@/hooks/react-query/guest/writings/use-mutation";
import { useEffect, useRef } from "react";
import { PostDetailSkeleton } from "@/components/reusable/skeleton/post-detail-skeleton";
import { DisplayPlate } from "@/components/reusable/display-plate";

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { data, isError, error, isLoading } = useGuestWritingBySlug({
    slug: params.slug,
  });

  const { mutate: incrementView } = useIncrementWritingView();

  const lastSlug = useRef<string | null>(null);

  useEffect(() => {
    if (params.slug && params.slug !== lastSlug.current && data) {
      lastSlug.current = params.slug;
      incrementView(params.slug);
    }
  }, [params.slug, incrementView, data]);

  // Langsung redirect jika 404
  if (isError && error && (error as any)?.status === 404) {
    notFound();
  }

  // Tampilkan toast untuk error selain 404
  if (isError && error && (error as any)?.status !== 404) {
    toast.error("Gagal memuat data", {
      description: error.message,
      id: "writing-error",
    });
  }

  return (
    <LoadingState data={!isLoading} loadingFallback={<PostDetailSkeleton />}>
      {data?.data && (
        <div className="flex flex-col space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
          <Link
            href="/writings"
            className="inline-flex justify-end items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-mono"
          >
            <ArrowLeft className="size-4" />
            Back to writings
          </Link>
          {/* Project content */}
          <article className="space-y-4 font-mono">
            {/* Technologies */}
            <div className="flex space-x-2" aria-label="Technologies used">
              {data.data.tags?.map(({ tag }: { tag: any }) => (
                <Badge variant={"outline"} key={tag.slug}>
                  {tag?.name}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{data.data.title}</h1>
              {/* Short description */}
              <p>{data.data.excerpt}</p>
            </div>
            <div className="flex gap-3 items-center mt-10">
              <div className="size-10 rounded-full overflow-hidden">
                <figure className="isolate z-[1] overflow-hidden select-none pointer-events-none object-cover">
                  <div
                    className="jsx-496024066 img-blur"
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
                  {formatCreatedUpdated(data.data.createdAt)}
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
                <span>{data.data.viewCount ?? "--"} views</span>
              </p>

              {/* Demo link */}
              <p
                className="flex text-xs items-center gap-2"
                aria-label="Link to project demo"
              >
                <Icons.BookOpen className="size-4" />
                <span>{data.data.readingTime} min read</span>
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
          <DisplayPlate value={data.data.content} />
        </div>
      )}
    </LoadingState>
  );
}
