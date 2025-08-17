"use client";
import { Icons } from "@/components/icons";
import BlogsCard from "@/components/reusable/home/blogs-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetGuestBlogs } from "@/hooks/react-query/guest/blogs/use-query";
import { useGuestTags } from "@/hooks/react-query/guest/tags/use-query";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce"; // Anda perlu membuat hook ini atau install library
import LoadingState from "@/components/reusable/state/loading-state";
import { BlogsSkeleton } from "@/components/reusable/skeleton/blogs-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State untuk filters
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

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const activeTag = searchParams.get("tag");

  // Fetch data dengan filters
  const { data, isLoading, error } = useGetGuestBlogs({
    search: debouncedSearchQuery,
    tag: activeTag || undefined,
    page: currentPage,
    limit: 2,
    sortBy,
    sortOrder,
  });

  const { data: tags } = useGuestTags();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (activeTag) params.set("tag", activeTag);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    router.replace(newUrl);
  }, [debouncedSearchQuery, activeTag, currentPage, sortBy, sortOrder, router]);

  // Handle tag click
  const handleTagClick = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams);

    if (activeTag === tagSlug) {
      params.delete("tag");
    } else {
      params.set("tag", tagSlug);
      params.delete("page"); // Reset page when filtering
    }

    router.push(`?${params.toString()}`);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCurrentPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
    router.push(window.location.pathname);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">Error loading blogs</div>
    );
  }

  return (
    <LoadingState data={!isLoading} loadingFallback={<BlogsSkeleton />}>
      <div className="space-y-4 font-mono lg:pt-24 pt-9 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
        <div className="flex flex-col space-y-8 items-center max-w-3xl mx-auto w-full justify-center">
          <header className="text-5xl font-bold">Blogs</header>

          <div className="flex flex-col gap-4 w-full">
            {/* Filter Controls */}
            <div className="flex space-x-2 justify-center flex-wrap">
              <Button
                className="rounded-full"
                variant={!activeTag && !searchQuery ? "default" : "secondary"}
                onClick={clearFilters}
              >
                Semua
              </Button>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-[220px] rounded-full border border-primary">
                  <SelectValue placeholder="Pilih urutan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Terbaru</SelectItem>
                  <SelectItem value="viewCount">
                    Paling Banyak Dilihat
                  </SelectItem>
                  <SelectItem value="title">Judul A-Z</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="rounded-full"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Icons.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari blog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border border-primary"
              />
            </div>

            {/* Tags Filter */}
            <div className="flex space-x-2 flex-wrap gap-2">
              {tags?.data?.map((item: { name: string; slug: string }) => (
                <Badge
                  key={item.slug}
                  className={`cursor-pointer transition-colors`}
                  variant={`${
                    activeTag === item.slug ? "default" : "secondary"
                  }`}
                  onClick={() => handleTagClick(item.slug)}
                >
                  {item?.name}
                </Badge>
              ))}
            </div>

            {/* Filter Info */}
            {data?.meta && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Menampilkan {data.data.length} dari {data.meta.total} blog
                  {data.meta.totalPages > 1 &&
                    ` (Halaman ${data.meta.page} dari ${data.meta.totalPages})`}
                </span>
                <div className="flex gap-2">
                  {searchQuery && (
                    <Badge variant="outline" className="text-xs">
                      "{searchQuery}"
                    </Badge>
                  )}
                  {activeTag && (
                    <Badge variant="outline" className="text-xs">
                      Tag:{" "}
                      {tags?.data?.find((t: any) => t.slug === activeTag)?.name}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="grid w-full grid-cols-1 gap-6 py-12">
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : data?.data?.length > 0 ? (
            <>
              <BlogsCard data={data.data} />

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!data.meta.hasPrevPage}
                  >
                    Previous
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
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">Tidak ada blog yang ditemukan</p>
                <p className="text-sm">
                  Coba ubah kata kunci pencarian atau filter
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LoadingState>
  );
}
