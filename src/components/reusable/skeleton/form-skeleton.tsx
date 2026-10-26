import { Skeleton } from "@/components/ui/skeleton";

type FormSkeletonProps = {
  contentClassName?: string;
};

/** Generic three-row stack used as the loading fallback of admin about forms. */
export default function FormSkeleton({
  contentClassName = "h-64",
}: FormSkeletonProps) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className={contentClassName} />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
