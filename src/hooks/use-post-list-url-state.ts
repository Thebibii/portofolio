"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

export type PostSortOrder = "asc" | "desc";

type Options = {
  /**
   * K-5: any filter change (search/tag/category) drops `?page` and returns to
   * page 1. Defaults to the Blog behaviour, which both lists now share.
   */
  resetPageOnFilterChange?: boolean;
};

const parsePage = (value: string | null) => {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

/** Builds `pathname?query`, or a bare pathname when nothing is left. */
export const buildUrl = (pathname: string, params: URLSearchParams) => {
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

/**
 * Single source of truth for the guest post list URL state.
 *
 * The URL owns page/tag/category/sort; only the search input is local while it
 * is being typed and is debounced into the URL. Filter changes can reset the
 * page (K-5) without duplicating the logic in both list pages.
 */
export function usePostListUrlState({
  resetPageOnFilterChange = true,
}: Options = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const page = parsePage(searchParams.get("page"));
  const sortBy = searchParams.get("sortBy") || DEFAULT_SORT_BY;
  const sortOrder = (searchParams.get("sortOrder") as PostSortOrder) || DEFAULT_SORT_ORDER;
  const activeTag = searchParams.get("tag");
  const activeCategory = searchParams.get("category");

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // URL -> input, for back/forward navigation and "Atur Ulang Filter".
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  // Input -> URL, after typing settles. Filter change resets the page (K-5).
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (resetPageOnFilterChange) {
      params.delete("page");
    }

    router.replace(buildUrl(pathname, params));
  }, [
    debouncedSearch,
    pathname,
    resetPageOnFilterChange,
    router,
    searchParams,
    urlSearch,
  ]);

  const setPage = useCallback(
    (nextPage: number, { replace = false }: { replace?: boolean } = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextPage > 1) {
        params.set("page", String(nextPage));
      } else {
        params.delete("page");
      }

      const url = buildUrl(pathname, params);
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [pathname, router, searchParams]
  );

  const toggleTag = useCallback(
    (tagSlug: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (activeTag === tagSlug) {
        params.delete("tag");
      } else {
        params.set("tag", tagSlug);
      }

      if (resetPageOnFilterChange) {
        params.delete("page");
      }

      router.push(buildUrl(pathname, params));
    },
    [activeTag, pathname, resetPageOnFilterChange, router, searchParams]
  );

  const toggleCategory = useCallback(
    (categorySlug: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (activeCategory === categorySlug) {
        params.delete("category");
      } else {
        params.set("category", categorySlug);
      }

      if (resetPageOnFilterChange) {
        params.delete("page");
      }

      router.push(buildUrl(pathname, params));
    },
    [activeCategory, pathname, resetPageOnFilterChange, router, searchParams]
  );

  // Sorting is not a filter: both lists have always kept the current page.
  const changeSort = useCallback(
    (nextSortBy: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextSortBy !== DEFAULT_SORT_BY) {
        params.set("sortBy", nextSortBy);
      } else {
        params.delete("sortBy");
      }

      router.push(buildUrl(pathname, params));
    },
    [pathname, router, searchParams]
  );

  const toggleSortOrder = useCallback(() => {
    const nextOrder: PostSortOrder = sortOrder === "asc" ? "desc" : "asc";
    const params = new URLSearchParams(searchParams.toString());

    if (nextOrder !== DEFAULT_SORT_ORDER) {
      params.set("sortOrder", nextOrder);
    } else {
      params.delete("sortOrder");
    }

    router.push(buildUrl(pathname, params));
  }, [pathname, router, searchParams, sortOrder]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    router.push(pathname);
  }, [pathname, router]);

  const buildPageHref = useCallback(
    (pageNumber: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (pageNumber > 1) {
        params.set("page", String(pageNumber));
      } else {
        params.delete("page");
      }

      return buildUrl(pathname, params);
    },
    [pathname, searchParams]
  );

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    page,
    setPage,
    sortBy,
    sortOrder,
    activeTag,
    activeCategory,
    toggleTag,
    toggleCategory,
    changeSort,
    toggleSortOrder,
    clearFilters,
    buildPageHref,
    hasActiveFilters: Boolean(activeTag || activeCategory || searchQuery),
  };
}
