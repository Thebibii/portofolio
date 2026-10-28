import Image from "next/image";
import Link from "next/link";
import { RESUME_URL } from "@/lib/constant";
import BibiSignature from "@/components/reusable/bibi-signature";

export type HomeHeroProfile = {
  name: string;
  nickname: string;
  role?: string | null;
  paragraphs: string[];
  photoUrl?: string | null;
};

/**
 * Cadangan kalau profil dari database belum diisi (profile = null).
 * Disamakan dengan fallback di /about supaya suaranya tidak berubah.
 */
const DEFAULT_PROFILE: HomeHeroProfile = {
  name: "Habibie Bayezid Wildan",
  nickname: "Bibi",
  role: "Web Developer",
  paragraphs: [
    "Sehari-hari saya membangun antarmuka web dengan React dan ekosistem di sekitarnya dari halaman sederhana sampai dashboard yang penuh data.",
  ],
  photoUrl: null,
};

/**
 * Entrance hero pakai animasi CSS murni (tw-animate-css), bukan motion.
 * Alasannya: hero mengisi satu layar penuh, jadi kalau opacity awal diatur
 * lewat style dari JS, paint pertama kosong sampai React hydrate — atau
 * kosong permanen kalau JS gagal. Dengan CSS, isi hero sudah terlihat sejak
 * HTML pertama; animasinya jalan sendiri tanpa menunggu JS.
 */
const enter =
  "animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out fill-mode-both motion-reduce:animate-none";

const linkText =
  "rounded-sm decoration-1 decoration-foreground/30 underline-offset-[6px] transition-colors";

const linkInteractive =
  "text-foreground hover:underline hover:decoration-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function HomeHero({
  profile,
}: {
  profile?: HomeHeroProfile | null;
}) {
  const content = profile ?? DEFAULT_PROFILE;

  const intro = content.paragraphs?.[0]?.trim();
  const role = content.role?.trim() || null;

  // Resume jadi link eksternal begitu RESUME_URL diisi; selama kosong
  // ditampilkan sebagai teks nonaktif supaya tidak ada href="" yang
  // memuat ulang halaman sendiri.
  const resumeUrl = RESUME_URL.trim();
  const hasResume = resumeUrl.length > 0;

  // Role pindah ke kalimat identitas di bawah nama, digabung dengan panggilan.
  const identityLine = [
    content.nickname ? `Biasa dipanggil ${content.nickname}.` : null,
    role ? (role.endsWith(".") ? role : `${role}.`) : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      aria-labelledby="home-hero-name"
      // 88px = tinggi navbar: p-6 (24px atas + 24px bawah) + konten tertinggi
      // size-10 avatar (40px). md:px-12 cuma horizontal, dan tombol menu
      // mobile posisinya fixed jadi tidak menambah tinggi. Kalau navbar
      // berubah, angka ini ikut diubah.
      className="relative flex min-h-[calc(100svh-88px)] w-full items-center"
    >
      {/* Padding vertikal di dalam area min-h, jadi tidak menambah tinggi hero */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12 lg:py-16 xl:px-0">
        <div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-10 lg:gap-16">
            <div className="min-w-0">
              <h1
                id="home-hero-name"
                className={`text-[2.125rem] leading-[1.04] font-bold tracking-tight sm:text-[2.5rem] lg:text-[3rem] xl:text-[3.25rem] ${enter}`}
                style={{ animationDelay: "60ms" }}
              >
                {content.name}
              </h1>

              <p
                className={`mt-3 min-h-5 text-sm text-muted-foreground ${enter}`}
                style={{ animationDelay: "150ms" }}
              >
                {identityLine}
              </p>

              {intro ? (
                <p
                  className={`mt-7 max-w-[54ch] text-[15px] leading-relaxed text-foreground/80 sm:mt-8 ${enter}`}
                  style={{ animationDelay: "240ms" }}
                >
                  {intro}
                </p>
              ) : null}

              <nav
                aria-label="Navigasi beranda"
                className={`mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border/80 pt-5 text-sm sm:mt-12 ${enter}`}
                style={{ animationDelay: "330ms" }}
              >
                {hasResume ? (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkText} ${linkInteractive}`}
                  >
                    Resume (CV)
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    title="URL CV belum diisi"
                    className={`${linkText} cursor-default text-foreground/55`}
                  >
                    Resume (CV)
                  </span>
                )}
                <Link
                  href="/about"
                  className={`${linkText} ${linkInteractive}`}
                >
                  Tentang Saya
                </Link>
              </nav>
            </div>

            {/* Cetakan foto kecil: benda yang sama dengan /about, ukurannya saja yang lain.
                Miringnya statis (rotate-3), masuknya lewat fade + zoom kecil. */}
            <figure
              className="hidden shrink-0 rotate-3 animate-in fade-in zoom-in-95 duration-700 ease-out fill-mode-both sm:block sm:justify-self-end motion-reduce:animate-none"
              style={{ animationDelay: "180ms" }}
            >
              <div className="bg-neutral-950 p-2 shadow-[0_18px_35px_-22px_rgba(0,0,0,0.65)] ring-1 ring-black/10 dark:ring-white/20">
                <Image
                  src={content.photoUrl || "/profile.png"}
                  alt={`Foto ${content.name}`}
                  width={224}
                  height={280}
                  priority
                  className="h-[220px] w-[176px] object-cover object-center lg:h-[280px] lg:w-[224px]"
                />
              </div>
            </figure>
          </div>

          <div
            className={`mt-10 flex justify-end sm:mt-8 ${enter}`}
            style={{ animationDelay: "420ms" }}
          >
            {/* Tanda tangan yang sama dengan /about. Ukuran sengaja lebih besar
                (144px vs 108px) supaya stroke SVG yang ikut skala ter-render
                lebih tebal dan terbaca di latar terang. */}
            <BibiSignature className="h-auto w-36 text-foreground/85" />
          </div>
        </div>
      </div>
    </section>
  );
}
