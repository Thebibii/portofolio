"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

type ErrorStateProps = {
  error?: unknown;
  title?: string;
  fallbackMessage?: string;
  onRetry?: () => void;
  className?: string;
};

/** Consistent inline error state with an optional retry action. */
export function ErrorState({
  error,
  title = "Gagal memuat data",
  fallbackMessage = "Silakan coba lagi nanti",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 px-6 py-10 text-center",
        className
      )}
    >
      <AlertCircle className="size-6 text-destructive" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">
          {getErrorMessage(error, fallbackMessage)}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}

type QueryStateProps = {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  skeleton?: ReactElement;
  isEmpty?: boolean;
  emptyFallback?: ReactElement;
  errorFallback?: ReactElement;
  children: ReactNode;
};

/**
 * Renders loading / error / empty states for a query in one place instead of
 * the four different patterns currently spread across guest pages.
 */
export function QueryState({
  isLoading = false,
  isError = false,
  error,
  onRetry,
  skeleton,
  isEmpty = false,
  emptyFallback,
  errorFallback,
  children,
}: QueryStateProps) {
  if (isError) {
    return errorFallback ?? <ErrorState error={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return skeleton ?? <QueryStateSkeleton />;
  }

  if (isEmpty) {
    return emptyFallback ?? null;
  }

  return <>{children}</>;
}

export function QueryStateSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-col gap-3" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}

export default QueryState;
