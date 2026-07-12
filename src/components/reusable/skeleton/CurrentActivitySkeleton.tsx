import { Skeleton } from "@/components/ui/skeleton";

export function CurrentActivitySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center flex-col gap-2">
        <Skeleton className="size-11 rounded-xl" />
        <Skeleton className="h-5 w-44" />
      </div>
      <div className="space-y-2 px-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  );
}
