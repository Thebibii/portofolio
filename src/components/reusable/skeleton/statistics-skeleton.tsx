import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StatisticsSkeleton() {
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
