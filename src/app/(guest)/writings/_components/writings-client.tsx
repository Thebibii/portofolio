"use client";
import { Suspense } from "react";
import { Icons } from "@/components/icons";
import BlogsCard from "@/components/reusable/home/blogs-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuestTags } from "@/hooks/react-query/guest/tags/use-query";
import { useGuestCategory } from "@/hooks/react-query/guest/category/use-query";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import LoadingState from "@/components/reusable/state/loading-state";
import {
  BlogsSkeleton,
  FilterSkeleton,
} from "@/components/reusable/skeleton/blogs-skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { useGetGuestWritings } from "@/hooks/react-query/guest/writings/use-query";
import { Label } from "@/components/ui/label";
import SortPopover from "@/components/reusable/guest/sort-popover";
import { BlogsCardSkeleton } from "@/components/reusable/skeleton/blogs-card-skeleton";

type InitialData = {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

type Props = {
  initialWritings?: InitialData;
  initialCategories?: any;
  initialTags?: any;
};

function WritingsContent({ initialWritings, initialCategories, initialTags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const activeTag = searchParams.get("tag");
  const activeCategory = searchParams.get("category");

  const { data, isLoading, error } = useGetGuestWritings({
    search: debouncedSearchQuery,
    tag: activeTag || undefined,
    category: activeCategory || undefined,
    page: currentPage,
    limit: 5,
    sortBy,
    sortOrder,
  }, initialWritings);

  const { data: category, isLoading: isLoadingCategory } =
    useGuestCategory("writing", initialCategories);
  const { data: tags, isLoading: isLoadingTags } = useGuestTags("writing", initialTags);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlPage = parseInt(searchParams.get("page") || "1");
    const urlSortBy = searchParams.get("sortBy") || "createdAt";
    const urlSortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlSortBy !== sortBy) setSortBy(urlSortBy);
    if (urlSortOrder !== sortOrder) setSortOrder(urlSortOrder);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearchQuery) {
      params.set("search", debouncedSearchQuery);
      params.delete("page");
      setCurrentPage(1);
    } else {
      params.delete("search");
    }

    const currentTag = searchParams.get("tag");
    const currentCategory = searchParams.get("category");
    const currentSortBy = searchParams.get("sortBy");
    const currentSortOrder = searchParams.get("sortOrder");

    if (currentTag) params.set("tag", currentTag);
    if (currentCategory) params.set("category", currentCategory);
    if (currentSortBy) params.set("sortBy", currentSortBy);
    if (currentSortOrder) params.set("sortOrder", currentSortOrder);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    const currentSearch = searchParams.get("search") || "";
    if (currentSearch !== debouncedSearchQuery) {
      if (queryString) {
        router.replace(newUrl);
      } else {
        router.replace(window.location.pathname);
      }
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    } else {
      params.delete("page");
    }

    if (sortBy !== "createdAt") {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    if (sortOrder !== "desc") {
      params.set("sortOrder", sortOrder);
    } else {
      params.delete("sortOrder");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    if (window.location.search !== `?${queryString}` && queryString !== "") {
      router.replace(newUrl);
    } else if (queryString === "" && window.location.search !== "") {
      router.replace(window.location.pathname);
    }
  }, [currentPage, sortBy, sortOrder]);

  const handleTagClick = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams);

    if (activeTag === tagSlug) {
      params.delete("tag");
    } else {
      params.set("tag", tagSlug);
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    router.push(`?${params.toString()}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams);

    if (activeCategory === categorySlug) {
      params.delete("category");
    } else {
      params.set("category", categorySlug);
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
    router.push(window.location.pathname);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    router.push(`?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const params = new URLSearchParams(searchParams);

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    if (newSortBy !== "createdAt") {
      params.set("sortBy", newSortBy);
    } else {
      params.delete("sortBy");
    }
    router.push(`?${params.toString()}`);
  };

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    const params = new URLSearchParams(searchParams);

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    if (newOrder !== "desc") {
      params.set("sortOrder", newOrder);
    } else {
      params.delete("sortOrder");
    }
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = activeTag || activeCategory || searchQuery;

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">Gagal memuat tulisan</div>
    );
  }

  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center max-w-3xl mx-auto w-full justify-center">
        <div className="space-y-4 items-center justify-center flex flex-col">
          <header className="h1 text-5xl">Tulisan</header>
          <p className="transition-colors bg-gradient-to-r from-gray-500/80 via-black to-gray-500/80 bg-clip-text text-transparent">
            Cerita tentang pertumbuhan dan penemuan
          </p>
        </div>
        <LoadingState
          data={!isLoadingTags && !isLoadingCategory}
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
              <SortPopover onSortChange={handleSortChange} sortBy={sortBy} />
              <Button
                variant="outline"
                onClick={handleSortOrderToggle}
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
                        onClick={() => handleCategoryClick(item.slug)}
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
                placeholder="Cari tulisan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border border-primary"
              />
            </div>

            {tags?.data?.length > 0 && (
              <div className="flex space-x-2 flex-wrap gap-2">
                {tags?.data?.map((item: { name: string; slug: string }) => (
                  <Badge
                    key={item.slug}
                    className="cursor-pointer transition-colors"
                    variant={activeTag === item.slug ? "default" : "secondary"}
                    onClick={() => handleTagClick(item.slug)}
                  >
                    {item?.name}
                  </Badge>
                ))}
              </div>
            )}

            {data?.meta && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Menampilkan {data.data.length} dari {data.meta.total} tulisan
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
        {isLoading ? (
          <BlogsCardSkeleton />
        ) : data?.data?.length > 0 ? (
          <>
            <BlogsCard to="writings" data={data.data} />

            {data.meta.totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!data.meta.hasPrevPage}
                >
                  Sebelumnya
                </Button>

                {Array.from(
                  { length: data.meta.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!data.meta.hasNextPage}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Tidak ada tulisan yang ditemukan</p>
              <p className="text-sm">
                Coba ubah kata kunci pencarian atau filter
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Atur Ulang Filter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WritingsPageFallback() {
  return <BlogsSkeleton />;
}

export default function WritingsClient({ initialWritings, initialCategories, initialTags }: Props) {
  return (
    <Suspense fallback={<WritingsPageFallback />}>
      <WritingsContent
        initialWritings={initialWritings}
        initialCategories={initialCategories}
        initialTags={initialTags}
      />
    </Suspense>
  );
}
