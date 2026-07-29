import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Fragment } from "react";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";

export default function NotFound() {
  return (
    <Fragment>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "inset-x-0 inset-y-[-30%] -z-50 h-full opacity-40  skew-y-12"
        )}
      />
      <div className="space-y-4 pt-9 pb-10 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
        {/* Article layout for 404 */}
        <article className="space-y-4 font-mono">
          {/* Empty space for badges alignment */}
          <div className="flex space-x-2 h-6" aria-label="Ruang kosong">
            {/* Intentionally empty to maintain spacing */}
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold">404 - Tulisan Tidak Ditemukan</h1>
            <p className="text-muted-foreground">
              Tulisan yang kamu cari tidak ada atau telah dihapus.
            </p>
          </div>

          <Separator orientation="horizontal" />

          {/* Action links styled like the stats section */}
          <div
            className="flex items-center gap-5 flex-wrap justify-between"
            aria-label="Opsi navigasi"
          >
            <Link
              href="/writings"
              className="flex text-sm items-center gap-2 hover:underline hover:text-primary transition-colors"
            >
              <Icons.BookOpen className="size-4" />
              <span>Lihat Semua Tulisan</span>
            </Link>

            <Link
              href="/"
              className="flex text-sm items-center gap-2 hover:underline hover:text-primary transition-colors"
            >
              <Icons.Home className="size-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <Separator orientation="horizontal" />

          {/* Additional helpful content */}
          <div className="space-y-4 py-8">
            <h2 className="text-xl font-semibold">Yang bisa kamu lakukan:</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="list-disc ml-4">
                <span>Periksa URL apakah ada typo</span>
              </li>
              <li className="list-disc ml-4">
                <span>
                  Jelajahi semua tulisan yang tersedia
                </span>
              </li>
              <li className="list-disc ml-4">
                <span>Kembali ke beranda dan mulai lagi</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </Fragment>
  );
}
