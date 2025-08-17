import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function AdminBlogsSkeleton() {
  return (
    <div className="grid grid-rows-1 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card className="group h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>

              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="h-8 w-8 p-0"
              >
                <Skeleton className="h-4 w-4 rounded-full" />
              </Button>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Cover Image */}
          <Skeleton className="w-full h-32 rounded-lg mb-4" />

          {/* Category */}
          <Skeleton className="h-5 w-20 rounded-md mb-3" />

          {/* Tags */}
          <div className="flex gap-1 mb-4">
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
