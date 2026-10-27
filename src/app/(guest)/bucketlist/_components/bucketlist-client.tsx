"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formattedDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { BucketItemData } from "@/types/bucketlist";

type Props = {
  items: BucketItemData[];
};

type LightboxState = {
  item: BucketItemData;
  index: number;
};

function buildMeta(item: BucketItemData) {
  const dateLabel = item.completedAt
    ? formattedDate(item.completedAt, "default", "MMMM yyyy")
    : "";
  const description = item.description?.trim() ?? "";

  return [dateLabel, description].filter(Boolean).join(", ");
}

export default function BucketlistClient({ items }: Props) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const activeItem = lightbox?.item ?? null;
  const activeImages = activeItem?.images ?? [];
  const activeIndex = lightbox?.index ?? 0;
  const activeSrc = activeImages[activeIndex];
  const completedCount = items.filter((item) => item.completed).length;

  function openLightbox(item: BucketItemData, index: number) {
    setLightbox({ item, index });
  }

  function step(direction: number) {
    setLightbox((prev) => {
      if (!prev || prev.item.images.length < 2) return prev;
      const total = prev.item.images.length;
      return { ...prev, index: (prev.index + direction + total) % total };
    });
  }

  return (
    <div className="font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center mx-auto w-full justify-center">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-4 items-center justify-center flex flex-col"
        >
          <h1 className="text-5xl h1">Daftar Impian</h1>
          <p className="transition-colors bg-gradient-to-r from-gray-500/80 via-black to-gray-500/80 bg-clip-text text-transparent">
            Daftar hal yang ingin saya lakukan dan miliki, setidaknya sekali
            dalam hidup.
          </p>
        </motion.header>

        {items.length === 0 ? (
          <div className="mt-16 flex w-full max-w-2xl lg:max-w-3xl mx-auto flex-col items-center justify-center gap-3 border-t border-border/60 py-24 text-center">
            <div className="flex size-11 items-center justify-center rounded-full border border-border/70 bg-muted/30">
              <Sparkles
                className="size-5 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Belum ada impian yang ditulis.
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-16 w-full max-w-2xl lg:max-w-3xl mx-auto border-t border-border/60">
              {items.map((item, index) => {
                const meta = buildMeta(item);

                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index, 12) * 0.04,
                      ease: "easeOut",
                    }}
                    className="group border-b border-border/60 transition-colors duration-200 hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-3 py-5 md:gap-4">
                      <span
                        className={cn(
                          "mt-1 flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-200",
                          item.completed
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-transparent group-hover:border-foreground/40",
                        )}
                      >
                        {item.completed && (
                          <>
                            <Check
                              className="size-3.5 text-primary-foreground"
                              strokeWidth={3}
                              aria-hidden
                            />
                            <span className="sr-only">Sudah tercapai</span>
                          </>
                        )}
                        {!item.completed && (
                          <span className="sr-only">Belum tercapai</span>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-medium text-foreground md:text-lg">
                          {item.title}
                        </p>
                        {meta && (
                          <p
                            title={meta}
                            className="truncate text-sm text-muted-foreground"
                          >
                            {meta}
                          </p>
                        )}
                      </div>

                      {item.images.length > 0 && (
                        <>
                          <ThumbnailStrip
                            images={item.images}
                            title={item.title}
                            max={2}
                            onOpen={(i) => openLightbox(item, i)}
                            className="sm:hidden"
                          />
                          <ThumbnailStrip
                            images={item.images}
                            title={item.title}
                            max={3}
                            onOpen={(i) => openLightbox(item, i)}
                            className="hidden sm:flex"
                          />
                        </>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
            <p className="mt-4 w-full max-w-2xl lg:max-w-3xl mx-auto text-right text-sm italic text-muted-foreground tabular-nums">
              {completedCount} dari {items.length} tercapai.
            </p>
          </>
        )}
      </div>

      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => {
          if (!open) setLightbox(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") step(-1);
            if (event.key === "ArrowRight") step(1);
          }}
          className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden border-border/60 bg-background/95 p-0 backdrop-blur sm:max-w-4xl"
        >
          {activeItem && activeSrc && (
            <>
              <DialogClose className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background">
                <X className="size-4" aria-hidden />
                <span className="sr-only">Tutup</span>
              </DialogClose>

              <div className="relative bg-muted/20">
                <motion.div
                  key={activeSrc}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center"
                >
                  <Image
                    src={activeSrc}
                    alt={`${activeItem.title} — foto ${activeIndex + 1}`}
                    width={1600}
                    height={1200}
                    sizes="(min-width: 1024px) 896px, 100vw"
                    className="h-auto max-h-[70vh] w-auto max-w-full object-contain"
                  />
                </motion.div>

                {activeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Foto sebelumnya"
                      className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Foto berikutnya"
                      className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
                <div className="min-w-0">
                  <DialogTitle className="truncate text-base font-medium">
                    {activeItem.title}
                  </DialogTitle>
                  <DialogDescription className="mt-1 truncate text-xs text-muted-foreground">
                    {buildMeta(activeItem)}
                    {buildMeta(activeItem) && activeImages.length > 1
                      ? " · "
                      : ""}
                    {activeImages.length > 1 &&
                      `${activeIndex + 1} / ${activeImages.length}`}
                  </DialogDescription>
                </div>

                {activeImages.length > 1 && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    {activeImages.map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        onClick={() =>
                          setLightbox({ item: activeItem, index: i })
                        }
                        aria-label={`Lihat foto ${i + 1}`}
                        className={cn(
                          "relative h-9 w-12 shrink-0 overflow-hidden rounded border transition-all duration-200",
                          i === activeIndex
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border/60 opacity-60 hover:opacity-100",
                        )}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ThumbnailStrip({
  images,
  title,
  max,
  onOpen,
  className,
}: {
  images: string[];
  title: string;
  max: number;
  onOpen: (index: number) => void;
  className?: string;
}) {
  const shown = images.slice(0, max);
  const remaining = images.length - shown.length;

  return (
    <div
      className={cn("flex shrink-0 items-center gap-1.5 md:gap-2", className)}
    >
      {shown.map((src, i) => {
        const isLast = i === shown.length - 1;

        return (
          <button
            key={src + i}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Buka foto ${i + 1} dari ${images.length} — ${title}`}
            className="group/thumb relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-border/70 bg-muted/40 transition-colors duration-200 hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:h-14 md:w-20"
          >
            <Image
              src={src}
              alt={`${title} — foto ${i + 1}`}
              fill
              sizes="(min-width: 768px) 80px, 64px"
              className="object-cover transition-transform duration-300 group-hover/thumb:scale-[1.04]"
            />
            {isLast && remaining > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-medium text-foreground backdrop-blur-[1px]">
                +{remaining}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
