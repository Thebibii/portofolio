"use client";

import { Icons } from "@/components/icons";
import BlogsCard from "@/components/reusable/home/blogs-card";
import PaginationBar from "@/components/reusable/guest/pagination-bar";
import SortPopover from "@/components/reusable/guest/sort-popover";
import { BlogsCardSkeleton } from "@/components/reusable/skeleton/blogs-card-skeleton";
import { FilterSkeleton } from "@/components/reusable/skeleton/blogs-skeleton";
import { ErrorState, QueryState } from "@/components/reusable/state/query-state";
import LoadingState from "@/components/reusable/state/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGuestCategory } from "@/hooks/react-query/guest/category/use-query";
import { useGuestTags } from "@/hooks/react-query/guest/tags/use-query";
import { GUEST_POST_HOOKS } from "@/hooks/react-query/guest/use-guest-posts";
import { usePostListUrlState } from "@/hooks/use-post-list-url-state";
import type { PostTypeConfig } from "@/lib/post-type-config";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { useEffect } from "react";

export type PostListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PostListInitialData = {
  data: any[];
  meta: PostListMeta;
};

type Props = {
  config: PostTypeConfig;
  initialData?: PostListInitialData;
  initialCategories?: any;
  initialTags?: any;
};

/**
 * Shared Blog/Writing list UI. Copy, URLs and card interactivity come from
 * `PostTypeConfig`; the list query comes from the matching hook set. URL state
 * lives in one hook so K-5 (filter change → page 1) is enforced for both.
 */
export default function PostListShell({
  config,
  initialData,
  initialCategories,
  initialTags,
}: Props) {
  const hooks = GUEST_POST_HOOKS[config.type];
  const {
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
    hasActiveFilters,
  } = usePostListUrlState();

  const { data, isLoading, error } = hooks.useList(
    {
      search: debouncedSearch,
      tag: activeTag || undefined,
      category: activeCategory || undefined,
      page,
      limit: 5,
      sortBy,
      sortOrder,
    },
    initialData
  );

  const categoryType = config.type.toLowerCase();
  const { data: category, isLoading: isLoadingCategory } = useGuestCategory(
    categoryType,
    initialCategories
  );
  const { data: tags, isLoading: isLoadingTags } = useGuestTags(
    categoryType,
    initialTags
  );

  const totalPages = data?.meta?.totalPages ?? 0;

  // A stale `?page` beyond the last page (deleted posts, new filters) is
  // corrected in the URL without adding history entries.
  useEffect(() => {
    if (isLoading || totalPages < 1) return;
    if (page > totalPages) {
      setPage(totalPages, { replace: true });
    }
  }, [isLoading, page, setPage, totalPages]);

  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center max-w-3xl mx-auto w-full justify-center">
        <div className="space-y-4 items-center justify-center flex flex-col">
          <header className="text-5xl h1">{config.listHeading}</header>
          <p className="transition-colors bg-gradient-to-r from-gray-500/80 via-black to-gray-500/80 bg-clip-text text-transparent">
            {config.listDescription}
          </p>
        </div>
        <LoadingState
          data={!isLoadingCategory && !isLoadingTags}
          loadingFallback={<FilterSkeleton />}
        >
          <div className="flex flex-col gap-4 w-full">
            <div className="flex space-x-2 justify-center flex-wrap">
              <Button
                className="rounded-full"
                variant={!hasActiveFilters ? "default" : "secondary"}
                onClick={clearFilters}
              >
                Semua
              </Button>
              <SortPopover onSortChange={changeSort} sortBy={sortBy} />
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="rounded-full"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </Button>
            </div>

            {category?.data?.length > 0 && (
              <ScrollArea className="w-full whitespace-nowrap rounded-md border p-2">
                <div className="flex w-max space-x-2">
                  {category?.data?.map(
                    (item: { name: string; slug: string }) => (
                      <Button
                        size="sm"
                        key={item.slug}
                        className="cursor-pointer transition-colors"
                        variant={
                          activeCategory === item.slug ? "default" : "secondary"
                        }
                        onClick={() => toggleCategory(item.slug)}
                      >
                        {item?.name}
                      </Button>
                    )
                  )}
                </div>
                <Scrollbar orientation="horizontal" />
              </ScrollArea>
            )}

            <div className="relative flex-1">
              <Label htmlFor="search">
                <Icons.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </Label>
              <Input
                id="search"
                placeholder={config.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border border-primary"
              />
            </div>

            {(tags?.data?.length > 0 || config.tagRowAlwaysVisible) && (
              <div className="flex space-x-2 flex-wrap gap-2">
                {tags?.data?.map((item: { name: string; slug: string }) => (
                  <Badge
                    key={item.slug}
                    className="cursor-pointer transition-colors"
                    variant={activeTag === item.slug ? "default" : "secondary"}
                    onClick={() => toggleTag(item.slug)}
                  >
                    {item?.name}
                  </Badge>
                ))}
              </div>
            )}

            {data?.meta && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Menampilkan {data.data.length} dari {data.meta.total}{" "}
                  {config.countLabel}
                  {data.meta.totalPages > 1 &&
                    ` (Halaman ${data.meta.page} dari ${data.meta.totalPages})`}
                </span>
                <div className="flex gap-2">
                  {searchQuery && (
                    <Badge variant="outline" className="text-xs">
                      &quot;{searchQuery}&quot;
                    </Badge>
                  )}
                  {activeTag && (
                    <Badge variant="outline" className="text-xs">
                      Tag:{" "}
                      {tags?.data?.find((t: any) => t.slug === activeTag)?.name}
                    </Badge>
                  )}
                  {activeCategory && (
                    <Badge variant="outline" className="text-xs">
                      Kategori:{" "}
                      {
                        category?.data?.find(
                          (c: any) => c.slug === activeCategory
                        )?.name
                      }
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </LoadingState>
      </div>

      <div className="grid w-full grid-cols-1 gap-6">
        <QueryState
          isLoading={isLoading}
          isError={Boolean(error)}
          error={error}
          skeleton={<BlogsCardSkeleton />}
          isEmpty={!data?.data?.length}
          errorFallback={<ErrorState title={config.listErrorTitle} />}
          emptyFallback={
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">{config.listEmptyTitle}</p>
                <p className="text-sm">{config.listEmptyDescription}</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Atur Ulang Filter
                </Button>
              </div>
            </div>
          }
        >
          <>
            <BlogsCard
              to={config.slug}
              data={data?.data}
              onTagClick={config.enableCardFilterLinks ? toggleTag : undefined}
              onCategoryClick={
                config.enableCardFilterLinks ? toggleCategory : undefined
              }
              activeTag={config.enableCardFilterLinks ? activeTag : undefined}
              activeCategory={
                config.enableCardFilterLinks ? activeCategory : undefined
              }
            />

            {totalPages > 1 && (
              <PaginationBar
                page={page}
                totalPages={totalPages}
                buildPageHref={buildPageHref}
              />
            )}
          </>
        </QueryState>
      </div>
    </div>
  );
}
