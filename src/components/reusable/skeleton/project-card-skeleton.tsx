import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectCardSkeleton() {
  return (
    <Card className="w-full font-mono">
      <CardHeader className="space-y-1">
        {/* Gambar Skeleton */}
        <div className="aspect-[16/9] w-full overflow-hidden rounded-md bg-gray-100">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Teks masih ada tapi bisa dikasih skeleton kecil sebagai highlight */}
        <CardTitle className="text-lg">Memuat judul...</CardTitle>
        <CardDescription className="space-y-2">
          <p>Memuat deskripsi...</p>
          <div className="flex flex-wrap space-x-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex-row justify-between">
        <div className="flex flex-row space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
        <Skeleton className="h-9 w-28" />
      </CardFooter>
    </Card>
  );
}
