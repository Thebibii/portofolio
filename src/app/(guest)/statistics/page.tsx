"use client";
import { useGuestStatistics } from "@/hooks/react-query/guest/statistics/use-query";
import LoadingState from "@/components/reusable/state/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Eye, ThumbsUp, Hash } from "lucide-react";
import { toast } from "sonner";

export default function StatisticsPage() {
  const { data, isLoading, isError, error } = useGuestStatistics();

  if (isError && error) {
    toast.error("Gagal memuat statistik", {
      description: error.message,
      id: "statistics-error",
    });
  }

  const d = data?.data;

  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center mx-auto w-full justify-center">
        <div className="space-y-4 items-center justify-center flex flex-col">
          <header className="text-5xl h1">Statistics</header>
          <p className="transition-colors bg-gradient-to-r from-gray-500/80 via-black to-gray-500/80 bg-clip-text text-transparent">
            Site analytics, visitor insights, and other interesting numbers
            about this portfolio.
          </p>
        </div>
        <div className="flex flex-col gap-16 md:gap-20 mt-16 w-full">
          <LoadingState
            data={!isLoading && !isError}
            loadingFallback={<StatisticsSkeleton />}
          >
            <div className="grid gap-6 w-full md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Blog</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">
                      {d?.blogs?.total ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-semibold">
                      {(d?.blogs?.totalViews ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ThumbsUp className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Likes:</span>
                    <span className="font-semibold">
                      {(d?.blogs?.totalLikes ?? 0).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Writing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">
                      {d?.writings?.total ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-semibold">
                      {(d?.writings?.totalViews ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ThumbsUp className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Likes:</span>
                    <span className="font-semibold">
                      {(d?.writings?.totalLikes ?? 0).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">
                      {d?.projects?.total ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-semibold">
                      {(d?.projects?.totalViews ?? 0).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <TopTenTable
              title="Top 10 Blogs"
              items={d?.blogs?.top10}
              showLikes
              basePath="/blogs"
            />
            <TopTenTable
              title="Top 10 Writings"
              items={d?.writings?.top10}
              showLikes
              basePath="/writings"
            />
            <TopTenTable
              title="Top 10 Projects"
              items={d?.projects?.top10?.map((p: any) => ({
                slug: p.slug,
                views: p.views,
              }))}
              basePath="/projects"
            />
          </LoadingState>
        </div>
      </div>
    </div>
  );
}

function TopTenTable({
  title,
  items,
  showLikes,
  basePath,
}: {
  title: string;
  items?: { slug: string; views: number; likes?: number }[];
  showLikes?: boolean;
  basePath: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {!items || items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-right font-medium">Views</th>
                {showLikes && (
                  <th className="px-4 py-3 text-right font-medium">Likes</th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.slug}
                  className="border-b last:border-0 odd:bg-muted/30 even:bg-background transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`${basePath}/${item.slug}`}
                      className="underline underline-offset-2 hover:text-primary transition-colors"
                    >
                      {item.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {(item.views ?? 0).toLocaleString()}
                  </td>
                  {showLikes && (
                    <td className="px-4 py-3 text-right tabular-nums">
                      {"likes" in item
                        ? ((item as any).likes ?? 0).toLocaleString()
                        : "-"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="flex flex-col gap-16 md:gap-20 w-full">
      <div className="grid gap-6 w-full md:grid-cols-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-20 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
          <div className="h-48 w-full rounded-lg bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
