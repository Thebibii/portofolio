"use client";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProfileImage from "../../../../../../public/profile.png";
import { formatCreatedUpdated } from "@/hooks/use-formatted-date";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useIncrementWritingView,
  useToggleWritingLike,
} from "@/hooks/react-query/guest/writings/use-mutation";
import {
  useWritingLikeStatus,
  useGuestWritingBySlug,
} from "@/hooks/react-query/guest/writings/use-query";
import { useEffect, useState } from "react";
import LikeButton from "@/components/reusable/like-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GiscusComments from "@/components/reusable/giscus-comments";
import { DisplayPlate } from "@/components/reusable/display-plate";

type PostTag = {
  tag: { name: string; slug: string };
};

type PostData = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  viewCount: number;
  readingTime: number;
  tags: PostTag[];
  createdAt: string;
  updatedAt: string;
  likedByMe: boolean;
  _count: { likes: number };
};

type Props = {
  post: PostData;
  slug: string;
};

export default function WritingDetailClient({ post, slug }: Props) {
  const { mutateAsync: incrementView } = useIncrementWritingView();
  const { mutate: toggleLike } = useToggleWritingLike();

  const { data: writingResponse } = useGuestWritingBySlug(
    { slug },
    { data: post }
  );
  const writingData = writingResponse?.data ?? post;

  const [liveViewCount, setLiveViewCount] = useState<number | null>(null);

  const { data: likeStatus } = useWritingLikeStatus(slug);

  useEffect(() => {
    let cancelled = false;

    if (slug) {
      incrementView(slug).then((result) => {
        if (!cancelled && result?.success) {
          setLiveViewCount(result.data.viewCount);
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
        href="/writings"
        className="inline-flex justify-end items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-mono"
      >
        <ArrowLeft className="size-4" />
        Back to writings
      </Link>
      <article className="space-y-4 font-mono">
        <div className="flex flex-wrap gap-2" aria-label="Technologies used">
          {post.tags?.map(({ tag }: PostTag) => (
            <Badge variant="outline" key={tag.slug}>
              {tag?.name}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <p>{post.excerpt}</p>
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
              {formatCreatedUpdated(post.createdAt)}
            </p>
          </div>
        </div>

        <Separator orientation="horizontal" />

        <div
          className="flex items-center gap-5 flex-wrap"
          aria-label="Project stats and links"
        >
          <p className="flex text-xs items-center gap-2 mr-auto">
            <Icons.Eye className="size-4" />
            <span>{liveViewCount ?? "--"} views</span>
          </p>

          <p
            className="flex text-xs items-center gap-2"
            aria-label="Link to project demo"
          >
            <Icons.BookOpen className="size-4" />
            <span>{writingData.readingTime} min read</span>
          </p>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("like-button")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex text-xs items-center gap-2"
                aria-label="Scroll to like button"
              >
                <Icons.Heart className="size-4" />
                <span>{writingData._count?.likes ?? 0} Likes</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Click to show love</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="horizontal" />
      </article>

      <DisplayPlate value={post.content} />

      <LikeButton
        key={likeStatus ? `${slug}-${likeStatus.liked}` : slug}
        slug={slug}
        initialCount={likeStatus?.likeCount ?? writingData._count?.likes ?? 0}
        initialLiked={likeStatus?.liked ?? false}
        onLike={toggleLike}
      />

      <GiscusComments />
    </div>
  );
}
