import { Skeleton } from "@/components/ui/skeleton";

export function BlogsSkeleton() {
  return (
    <div className="space-y-12  pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center max-w-3xl mx-auto w-full justify-center">
        {/* Header */}
        <Skeleton className="h-12 w-40" />

        <div className="flex flex-col gap-4 w-full">
          {/* Filter Controls */}
          <div className="flex space-x-2 justify-center flex-wrap">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-10 rounded-full" />
          </div>

          {/* Search Input */}
          <Skeleton className="h-10 w-full rounded-full" />

          {/* Tags Filter */}
          <div className="flex space-x-2 flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>

          {/* Filter Info */}
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-2/5" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Results (Cards) */}
      <div className="grid w-full grid-cols-1 gap-6 py-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-4 flex flex-col gap-4 shadow-sm"
          >
            {/* Cover */}
            <Skeleton className="h-48 w-full rounded-lg" />

            {/* Title */}
            <Skeleton className="h-6 w-3/4" />

            {/* Excerpt */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-8">
        <Skeleton className="h-9 w-20 rounded-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-full" />
        ))}
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Filter Controls Skeleton */}
      <div className="flex space-x-2 justify-center flex-wrap">
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 sm:w-[220px] w-24 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Category Filter Skeleton */}
      <div className="w-full whitespace-nowrap rounded-md border p-2">
        <div className="flex w-max space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </div>

      {/* Search Input Skeleton */}
      <div className="relative flex-1">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>

      {/* Tags Filter Skeleton */}
      <div className="flex space-x-2 flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-14 rounded-full" />
        ))}
      </div>

      {/* Filter Info Skeleton */}
      <div className="flex items-center justify-between text-sm">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
