import { Skeleton } from "@/components/ui/skeleton";

export function ExperienceSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 md:grid-cols-[260px_1fr] w-full md:gap-8"
        >
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}
