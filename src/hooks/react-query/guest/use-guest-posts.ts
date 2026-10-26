import { baseURL } from "@/lib/api";
import { createHttpError, getErrorMessage } from "@/lib/errors";
import { POST_TYPE_CONFIG, type PostTypeConfig } from "@/lib/post-type-config";
import { qk } from "@/lib/react-query/keys";
import { PostType } from "@/types/blogs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface GuestPostFilters {
  search?: string;
  tag?: string;
  category?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type GuestPostHooksConfig = PostTypeConfig & {
  /**
   * Key of a shared list that also carries the view count (currently the
   * featured-blogs list). Omitted by types that have no such list.
   */
  featuredListKey?: () => readonly unknown[];
};

/**
 * Builds the public React Query hooks for one post type. Type-specific
 * behaviour comes from `PostTypeConfig` plus the optional `featuredListKey`,
 * never from `if (type === ...)` branches.
 */
export function createGuestPostHooks(config: GuestPostHooksConfig) {
  const entity = config.type.toLowerCase();

  // E-006: one fallback per action, defined once for both post types.
  const messages = {
    list: `Failed to fetch ${config.slug}`,
    detail: `Failed to fetch ${config.slug}`,
    likeStatus: "Failed to fetch like status",
    incrementView: "Failed to increment view",
    toggleLike: "Failed to toggle like",
  };

  // Single place for request handling, so callbacks never repeat it.
  const request = async (
    path: string,
    fallback: string,
    init?: RequestInit
  ) => {
    const res = await fetch(`${baseURL}/guest/${config.slug}${path}`, init);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw createHttpError(
        getErrorMessage(data.message ?? data.error, fallback),
        res.status
      );
    }

    return res.json();
  };

  const useList = (filters?: GuestPostFilters, initialData?: any) =>
    useQuery({
      queryKey: qk.guest.posts(config.slug, filters),
      queryFn: () => {
        const params = new URLSearchParams();

        if (filters?.search) params.append("search", filters.search);
        if (filters?.tag) params.append("tag", filters.tag);
        if (filters?.category) params.append("category", filters.category);
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.sortBy) params.append("sortBy", filters.sortBy);
        if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

        const queryString = params.toString();

        return request(queryString ? `?${queryString}` : "", messages.list);
      },
      initialData,
    });

  const useBySlug = ({ slug }: { slug: string }, initialData?: any) =>
    useQuery({
      queryKey: qk.guest.post(config.slug, slug),
      queryFn: () => request(`/${slug}`, messages.detail),
      initialData,
      staleTime: 5 * 60 * 1000,
    });

  const useLikeStatus = (slug: string) =>
    useQuery({
      queryKey: qk.guest.postLiked(config.slug, slug),
      queryFn: () => request(`/${slug}/like`, messages.likeStatus),
      retry: false,
    });

  const useIncrementView = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: [`guest.increment.${entity}.view`],
      mutationFn: (slug: string) =>
        request(`/${slug}/view`, messages.incrementView, {
          method: "PATCH",
        }),
      onSuccess: (result, slug) => {
        if (!result?.success) return;

        queryClient.setQueryData(
          qk.guest.post(config.slug, slug),
          (old: any) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: { ...old.data, viewCount: result.data.viewCount },
            };
          }
        );

        const featuredKey = config.featuredListKey?.();
        if (!featuredKey) return;

        queryClient.setQueryData(featuredKey, (old: any) => {
          if (!old) return old;
          return old.map((post: any) =>
            post.slug === slug
              ? { ...post, viewCount: result.data.viewCount }
              : post
          );
        });
      },
    });
  };

  const useToggleLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: [`guest.toggle.${entity}.like`],
      mutationFn: (slug: string) =>
        request(`/${slug}/like`, messages.toggleLike, {
          method: "PATCH",
        }),
      onSuccess: (result, slug) => {
        if (result?.liked !== undefined) {
          queryClient.setQueryData(qk.guest.postLiked(config.slug, slug), {
            liked: result.liked,
            likeCount: result.likeCount,
          });
        }
        if (result?.likeCount !== undefined) {
          queryClient.setQueryData(
            qk.guest.post(config.slug, slug),
            (old: any) => {
              if (!old?.data) return old;
              return {
                ...old,
                data: {
                  ...old.data,
                  _count: { likes: result.likeCount },
                },
              };
            }
          );
        }
      },
    });
  };

  return {
    useList,
    useBySlug,
    useLikeStatus,
    useIncrementView,
    useToggleLike,
  };
}

export const blogHooks = createGuestPostHooks({
  ...POST_TYPE_CONFIG[PostType.BLOG],
  featuredListKey: () => qk.guest.featuredBlogs,
});
export const writingHooks = createGuestPostHooks(
  POST_TYPE_CONFIG[PostType.WRITING]
);

/** Hook set per post type, indexed by config so UI can stay type-agnostic. */
export const GUEST_POST_HOOKS: Record<
  PostType,
  ReturnType<typeof createGuestPostHooks>
> = {
  [PostType.BLOG]: blogHooks,
  [PostType.WRITING]: writingHooks,
};
