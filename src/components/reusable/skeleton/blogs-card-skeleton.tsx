import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function BlogsCardSkeleton() {
  return (
    <Card className="w-full font-mono">
      <div className="flex flex-col md:flex-row">
        {/* Gambar skeleton */}
        <div className="flex-none p-4 flex items-center md:basis-80 order-1 md:order-2">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        </div>

        {/* Konten */}
        <div className="flex-1 flex space-y-2 flex-col h-full order-2 md:order-1">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg space-y-2">
              <div className="flex space-x-2 justify-between">
                {/* Category Badge Skeleton */}
                <Skeleton className="h-6 w-16 rounded-md" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-12 rounded-md" />
                  <Skeleton className="h-6 w-12 rounded-md" />
                </div>
              </div>
              {/* Title Text tetap ada */}
              <p className="font-semibold">Judul Blog Loading...</p>
            </CardTitle>
            <CardDescription className="w-full space-y-2">
              <p>Deskripsi singkat sedang dimuat...</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            {/* Stats dan Button */}
            <div className="flex items-center flex-wrap space-y-2 sm:space-y-0">
              <div className="flex flex-row space-x-4 mr-auto">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="w-full sm:w-fit mt-4 sm:mt-0">
                <Button disabled size="sm" className="bg-primary/50 w-full">
                  Baca selengkapnya
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
