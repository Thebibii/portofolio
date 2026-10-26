"use client";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCreatedUpdated } from "@/lib/format-date";
import Image from "next/image";
import ProfileImage from "../../../../public/profile.png";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GUEST_POST_HOOKS } from "@/hooks/react-query/guest/use-guest-posts";
import LikeButton from "@/components/reusable/like-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { DisplayPlate } from "@/components/reusable/display-plate";
import GiscusComments from "@/components/reusable/giscus-comments";
import type { PostTypeConfig } from "@/lib/post-type-config";

export type PostTag = {
  tag: { name: string; slug: string };
};

export type PostData = {
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
  config: PostTypeConfig;
};

export default function PostDetailLayout({ post, slug, config }: Props) {
  const hooks = GUEST_POST_HOOKS[config.type];

  const { mutateAsync: incrementView } = hooks.useIncrementView();
  const { mutate: toggleLike } = hooks.useToggleLike();

  const { data: postResponse } = hooks.useBySlug({ slug }, { data: post });
  const postData = postResponse?.data ?? post;

  const [liveViewCount, setLiveViewCount] = useState<number | null>(null);

  const { data: likeStatus } = hooks.useLikeStatus(slug);

  useEffect(() => {
    let cancelled = false;

    if (config.features.view && slug) {
      incrementView(slug).then((result) => {
        if (!cancelled && result?.success) {
          setLiveViewCount(result.data.viewCount);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [config.features.view, slug, incrementView]);

  return (
    <div className="flex flex-col space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <Link
        href={`/${config.slug}`}
        className="inline-flex justify-end items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-mono"
      >
        <ArrowLeft className="size-4" />
        {config.detailBackLabel}
      </Link>
      <article className="space-y-4 font-mono">
        <div className="flex flex-wrap gap-2" aria-label="Label tag">
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
                className="jsx-496024066"
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
          aria-label="Statistik dan tautan"
        >
          {config.features.view && (
            <p className="flex text-xs items-center gap-2 mr-auto">
              <Icons.Eye className="size-4" />
              <span>{liveViewCount ?? "--"} dilihat</span>
            </p>
          )}

          {config.features.readingTime && (
            <p
              className="flex text-xs items-center gap-2"
              aria-label="Waktu baca"
            >
              <Icons.BookOpen className="size-4" />
              <span>{postData.readingTime} menit baca</span>
            </p>
          )}

          {config.features.like && (
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
                  aria-label="Gulir ke tombol suka"
                >
                  <Icons.Heart className="size-4" />
                  <span>{postData._count?.likes ?? 0} Suka</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Klik untuk menyukai</TooltipContent>
            </Tooltip>
          )}
        </div>

        <Separator orientation="horizontal" />
      </article>
      <div className="relative">
        <DisplayPlate value={post.content} />
      </div>

      {config.features.like && (
        <LikeButton
          key={likeStatus ? `${slug}-${likeStatus.liked}` : slug}
          slug={slug}
          initialCount={likeStatus?.likeCount ?? postData._count?.likes ?? 0}
          initialLiked={likeStatus?.liked ?? false}
          onLike={toggleLike}
        />
      )}

      <GiscusComments />
    </div>
  );
}
