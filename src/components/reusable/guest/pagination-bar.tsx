"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function getPageList(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const clamped = Math.min(Math.max(1, current), total);

  if (clamped <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", total];
  }

  if (clamped >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "ellipsis", clamped - 1, clamped, clamped + 1, "ellipsis", total];
}

type PaginationBarProps = {
  page: number;
  totalPages: number;
  buildPageHref: (page: number) => string;
  className?: string;
};

/** Responsive pagination shared by the Blog and Writing lists. */
export default function PaginationBar({
  page,
  totalPages,
  buildPageHref,
  className = "mt-8 font-mono",
}: PaginationBarProps) {
  const safePage = Math.min(
    Math.max(1, Number.isFinite(page) ? page : 1),
    Math.max(1, totalPages)
  );
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <Pagination aria-label="Pagination" className={className}>
      <PaginationContent className="max-w-full flex-wrap justify-center gap-1.5">
        {canPrev ? (
          <PaginationItem className="shrink-0">
            <PaginationPrevious
              asChild
              aria-label="Halaman sebelumnya"
              className="h-11 min-w-11 gap-1 rounded-full border border-border px-3 sm:pl-3"
            >
              <Link href={buildPageHref(safePage - 1)}>
                <ChevronLeft />
                <span className="hidden lg:block">Sebelumnya</span>
              </Link>
            </PaginationPrevious>
          </PaginationItem>
        ) : (
          <PaginationItem className="shrink-0">
            <PaginationPrevious
              aria-label="Halaman sebelumnya"
              aria-disabled={true}
              tabIndex={-1}
              className="pointer-events-none h-11 min-w-11 gap-1 rounded-full border border-border px-3 opacity-50 sm:pl-3"
            >
              <ChevronLeft />
              <span className="hidden lg:block">Sebelumnya</span>
            </PaginationPrevious>
          </PaginationItem>
        )}

        <PaginationItem className="shrink-0 sm:hidden">
          <span className="whitespace-nowrap px-1 text-sm text-muted-foreground">
            Halaman {safePage} dari {totalPages}
          </span>
        </PaginationItem>

        {getPageList(safePage, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem
              key={`ellipsis-${index}`}
              className="hidden shrink-0 sm:flex"
            >
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item} className="hidden shrink-0 sm:flex">
              <PaginationLink
                href={buildPageHref(item)}
                isActive={item === safePage}
                aria-label={`Halaman ${item}`}
                className={`h-11 w-auto min-w-11 rounded-full border border-border px-3 tabular-nums ${
                  item === safePage
                    ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 dark:border-transparent dark:bg-primary dark:hover:bg-primary/90"
                    : ""
                }`}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {canNext ? (
          <PaginationItem className="shrink-0">
            <PaginationNext
              asChild
              aria-label="Halaman berikutnya"
              className="h-11 min-w-11 gap-1 rounded-full border border-border px-3 sm:pr-3"
            >
              <Link href={buildPageHref(safePage + 1)}>
                <span className="hidden lg:block">Berikutnya</span>
                <ChevronRight />
              </Link>
            </PaginationNext>
          </PaginationItem>
        ) : (
          <PaginationItem className="shrink-0">
            <PaginationNext
              aria-label="Halaman berikutnya"
              aria-disabled={true}
              tabIndex={-1}
              className="pointer-events-none h-11 min-w-11 gap-1 rounded-full border border-border px-3 opacity-50 sm:pr-3"
            >
              <span className="hidden lg:block">Berikutnya</span>
              <ChevronRight />
            </PaginationNext>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
