import { baseURL } from "@/lib/api";
import { createHttpError, getErrorMessage } from "@/lib/errors";
import { POST_TYPE_CONFIG, type PostTypeConfig } from "@/lib/post-type-config";
import { qk } from "@/lib/react-query/keys";
import { PostType, type Post, type PostDelete } from "@/types/blogs";
import type { APIResponse } from "@/types/response";
import {
  keepPreviousData,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export interface AdminPostFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  tagId?: string;
}

type MutationCallbacks<TData> = {
  onSuccess: (body: TData) => void;
  onError?: (body: any) => void;
};

/**
 * Builds the admin React Query hooks for one post type.
 *
 * Everything type-specific (endpoint, cache key prefix, labels) comes from
 * `PostTypeConfig`, so a third post type only needs a new config entry instead
 * of another copy of these hooks.
 */
export function createAdminPostHooks(config: PostTypeConfig) {
  const entity = config.type.toLowerCase();
  const label = config.label.toLowerCase();

  // E-006: one fallback per action, defined once for both post types.
  const messages = {
    list: `Failed to fetch ${config.slug}`,
    detail: `Failed to fetch ${config.slug}`,
    create: `Gagal membuat ${label}`,
    update: `Gagal memperbarui ${label}`,
    delete: `Gagal menghapus ${label}`,
  };

  // Single place for request handling, so callbacks never repeat it.
  const request = async (
    path: string,
    fallback: string,
    init?: RequestInit
  ) => {
    const res = await fetch(`${baseURL}/admin/${config.slug}${path}`, init);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw createHttpError(
        getErrorMessage(data.error, fallback),
        res.status
      );
    }

    return res.json();
  };

  const jsonHeaders = { "Content-Type": "application/json" };

  const useList = (filters: AdminPostFilters = {}) => {
    const { page = 1, limit = 15, search, status, categoryId, tagId } = filters;

    return useQuery({
      // The list key prefix is preserved so invalidateQueries matches every
      // page/filter combination (partial key matching).
      queryKey: [
        ...qk.admin.posts(config.slug),
        { page, limit, search, status, categoryId, tagId },
      ],
      queryFn: () => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        // Only include filter params when set — never send empty strings / "all".
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        if (categoryId) params.set("categoryId", categoryId);
        if (tagId) params.set("tagId", tagId);

        return request(`?${params.toString()}`, messages.list);
      },
      // Keep the previous page/filter data visible while the next one loads.
      placeholderData: keepPreviousData,
    });
  };

  const useBySlug = ({ slug }: { slug: string }) =>
    useQuery({
      queryKey: qk.admin.post(config.slug, slug),
      queryFn: () => request(`/${slug}`, messages.detail),
    });

  const useCreate = ({
    onSuccess,
    onError,
  }: MutationCallbacks<APIResponse<{ title: string }>>) =>
    useMutation({
      mutationKey: [`admin.create.${entity}`],
      mutationFn: (body: Post) =>
        request("", messages.create, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify(body),
        }),
      onSuccess,
      onError,
    });

  const useUpdate = ({
    slug,
    onSuccess,
    onError,
  }: { slug: string } & MutationCallbacks<APIResponse<{ title: string }>>) =>
    useMutation({
      mutationKey: [`admin.update.${entity}`, slug],
      mutationFn: (body: Post) =>
        request(`/${slug}`, messages.update, {
          method: "PUT",
          headers: jsonHeaders,
          body: JSON.stringify(body),
        }),
      onSuccess,
      onError,
    });

  const useDelete = ({
    onSuccess,
    onError,
  }: MutationCallbacks<APIResponse<{ id: string }>>) =>
    useMutation({
      mutationKey: [`admin.delete.${entity}`],
      mutationFn: (body: PostDelete) =>
        request(`/${body.slug}`, messages.delete, {
          method: "DELETE",
          headers: jsonHeaders,
          body: JSON.stringify(body.slug),
        }),
      onSuccess,
      onError,
    });

  return { useList, useBySlug, useCreate, useUpdate, useDelete };
}

export const blogHooks = createAdminPostHooks(
  POST_TYPE_CONFIG[PostType.BLOG]
);
export const writingHooks = createAdminPostHooks(
  POST_TYPE_CONFIG[PostType.WRITING]
);

/** Hook set per post type, indexed by config so admin UI can stay type-agnostic. */
export const ADMIN_POST_HOOKS: Record<
  PostType,
  ReturnType<typeof createAdminPostHooks>
> = {
  [PostType.BLOG]: blogHooks,
  [PostType.WRITING]: writingHooks,
};
