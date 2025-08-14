import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AdminProjectsSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input skeleton */}
        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="flex gap-2">
          {/* Select filter skeleton */}
          <Skeleton className="h-10 w-[180px]" />

          {/* Create button skeleton */}
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      <div className="grid grid-rows-1 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card className="w-full max-w-sm" key={i}>
            {/* Image placeholder */}
            <div className="aspect-[16/9] w-full overflow-hidden">
              <Skeleton className="h-full w-full" />
            </div>

            <Separator orientation="horizontal" />

            {/* Title & Description */}
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-3/4" />
              </CardTitle>
              <CardDescription className="space-y-3 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />

                {/* Badges */}
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>

                <div className="flex space-x-2 flex-wrap">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardDescription>
            </CardHeader>

            {/* Footer buttons */}
            <CardFooter className="flex-row justify-between">
              <div className="flex flex-row space-x-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
              <div className="flex flex-row space-x-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
