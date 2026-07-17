"use client";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCreatedUpdated } from "@/hooks/use-formatted-date";
import Image from "next/image";
import ProfileImage from "../../../../../../public/profile.png";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useIncrementBlogView,
  useToggleBlogLike,
} from "@/hooks/react-query/guest/blogs/use-mutation";
import {
  useBlogLikeStatus,
  useGuestBlogBySlug,
} from "@/hooks/react-query/guest/blogs/use-query";
import LikeButton from "@/components/reusable/like-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { DisplayPlate } from "@/components/reusable/display-plate";
import GiscusComments from "@/components/reusable/giscus-comments";

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

export default function BlogDetailClient({ post, slug }: Props) {
  const { mutate: incrementView } = useIncrementBlogView();
  const { mutate: toggleLike } = useToggleBlogLike();

  const { data: blogResponse } = useGuestBlogBySlug({ slug }, { data: post });
  const blogData = blogResponse?.data ?? post;

  const [liveViewCount, setLiveViewCount] = useState<number | null>(null);

  const { data: likeStatus } = useBlogLikeStatus(slug);

  const lastSlug = useRef<string | null>(null);

  useEffect(() => {
    if (slug && slug !== lastSlug.current) {
      lastSlug.current = slug;
      incrementView(slug, {
        onSuccess: (result) => {
          if (result?.success) {
            setLiveViewCount(result.data.viewCount);
          }
        },
      });
    }
  }, [slug, incrementView]);

  return (
    <div className="flex flex-col space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <Link
        href="/blogs"
        className="inline-flex justify-end items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-mono"
      >
        <ArrowLeft className="size-4" />
        Back to blogs
      </Link>
      <article className="space-y-4 font-mono">
        <div className="flex space-x-2" aria-label="Technologies used">
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
            <span>{blogData.readingTime} min read</span>
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
                <span>{blogData._count?.likes ?? 0} Likes</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Click to show love</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="horizontal" />
      </article>
      <div className="relative">
        <DisplayPlate value={post.content} />
      </div>

      <LikeButton
        key={likeStatus ? `${slug}-${likeStatus.liked}` : slug}
        slug={slug}
        initialCount={likeStatus?.count ?? post._count?.likes ?? 0}
        initialLiked={likeStatus?.liked ?? false}
        onLike={toggleLike}
      />

      <GiscusComments />
    </div>
  );
}
