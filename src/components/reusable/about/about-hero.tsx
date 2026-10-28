"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Icons } from "@/components/icons";
import BibiSignature from "@/components/reusable/bibi-signature";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AboutHeroProfile = {
  name: string;
  nickname: string;
  role?: string | null;
  location?: string | null;
  paragraphs: string[];
  stackLine: string;
  photoUrl?: string | null;
  techStack: string[];
};

/**
 * Fallback dipakai kalau profil dari database belum diisi (profile = null).
 * Teks Indonesia di bawah ini sengaja dipertahankan sebagai default.
 */
const DEFAULT_PROFILE: AboutHeroProfile = {
  name: "Habibie Bayezid Wildan",
  nickname: "Bibi",
  role: "Software engineer di ekosistem React",
  location: "Padang Panjang, Indonesia",
  paragraphs: [
    "Sehari-hari saya membangun antarmuka web dengan React dan ekosistem di sekitarnya dari halaman sederhana sampai dashboard yang penuh data.",
    "Semua ini berawal dari rasa penasaran. Dulu saya hobi membongkar situs orang lain lewat inspect element, mengubah-ubah warnanya, lalu mencoba membangun versi saya sendiri. Ternyata rasa penasaran itu yang akhirnya jadi pekerjaan.",
    "Saya menulis karena menulis memaksa saya berpikir lebih jernih. Saat mencoba menjelaskan satu konsep dengan bahasa sederhana, saya sering baru sadar bagian mana yang sebenarnya belum saya pahami.",
    "Sekarang saya lebih banyak berada di antara desain dan engineering: menerjemahkan ide jadi layar yang enak dipakai, lalu memastikan semuanya tetap rapi di balik layar.",
  ],
  stackLine:
    "Saya juga seorang full-stack engineer, berikut tech stack favorit saya saat ini:",
  techStack: ["nextjs", "nodejs", "typescript", "tailwind", "react", "vercel"],
};

// Urutan logo mengikuti baris di atas.
const TECH_STACK = [
  { key: "nextjs", name: "Next.js", Icon: Icons.Nextjs },
  { key: "nodejs", name: "Node.js", Icon: Icons.Nodejs },
  { key: "typescript", name: "TypeScript", Icon: Icons.TypeScript },
  { key: "tailwind", name: "Tailwind CSS", Icon: Icons.Tailwind },
  { key: "react", name: "React", Icon: Icons.React },
  { key: "vercel", name: "Vercel", Icon: Icons.Vercel },
] as const;

export default function AboutHero({
  profile,
}: {
  profile?: AboutHeroProfile | null;
}) {
  const content = profile ?? DEFAULT_PROFILE;
  const selectedTechStack = content.techStack?.length
    ? TECH_STACK.filter(({ key }) => content.techStack.includes(key))
    : TECH_STACK;

  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.09,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.55, ease: "easeOut" },
    },
  };

  return (
    <section aria-labelledby="about-hero-name" className="w-full">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid w-full items-center gap-12 md:grid-cols-[260px_minmax(0,1fr)] md:gap-16 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-28"
      >
        {/* Cetakan foto + klip kertas */}
        <motion.div
          variants={item}
          className="flex items-center justify-center lg:justify-start"
        >
          <div className="relative w-full max-w-[248px] sm:max-w-[300px] md:max-w-[260px] lg:max-w-[300px]">
            {/* cetakan kedua di belakang: hanya tepi kertas yang menyembul di atas & kiri */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-1.5 -left-1.5 right-1.5 bottom-1.5 -rotate-[1deg] bg-[#1a1a1a] shadow-[0_10px_20px_-14px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
            />

            {/* kertas foto: bingkai hitam, sedikit miring seperti diletakkan di meja */}
            <div className="group relative rotate-[2.5deg] bg-neutral-950 p-3 pb-0 shadow-[0_22px_45px_-24px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-transform duration-500 ease-out hover:rotate-0 dark:ring-white/20">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
                <Image
                  src={profile?.photoUrl || "/profile.png"}
                  alt={`Foto ${content.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 280px"
                  className="object-cover object-center"
                />
              </div>

              <div className="flex h-[88px] items-end px-1 pb-4">
                <BibiSignature className="h-auto w-[108px] text-neutral-100" />
              </div>

              {/* klip binder di tengah atas, menjepit tepi kertas */}
              <div className="absolute -top-5 left-1/2 w-20 -translate-x-1/2 rotate-[4deg] drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
                <BinderClip className="h-auto w-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Teks perkenalan */}
        <motion.div variants={item} className="flex flex-col gap-7">
          <div className="space-y-3">
            <h1
              id="about-hero-name"
              className="text-[2.25rem] leading-[1.05] font-bold tracking-tight sm:text-5xl"
            >
              {content.name}
            </h1>
            {/* <p className="text-sm text-muted-foreground sm:text-base">
              {heroContent.role}
              <span
                aria-hidden="true"
                className="px-2 text-muted-foreground/40"
              >
                /
              </span>
              {heroContent.location}
            </p> */}
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
            <p className="text-foreground">
              Halo, saya {content.nickname}.
            </p>
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <p className="max-w-[52ch] text-sm text-foreground/80">
              {content.stackLine}
            </p>
            <TooltipProvider>
              <ul
                aria-label="Tech stack favorit"
                className="flex flex-wrap items-center gap-x-7 gap-y-4"
              >
                {selectedTechStack.map(({ name, Icon }) => (
                  <li key={name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={name}
                          className="flex cursor-pointer items-center rounded-sm text-foreground/80 transition-colors duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                        >
                          <Icon
                            aria-hidden="true"
                            className="size-7 sm:size-8"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>{name}</TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function BinderClip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 58"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="clip-metal" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#f4f5f6" />
          <stop offset="0.3" stopColor="#cdd0d5" />
          <stop offset="0.55" stopColor="#8b9098" />
          <stop offset="0.78" stopColor="#bcc0c6" />
          <stop offset="1" stopColor="#e8e9eb" />
        </linearGradient>
        <linearGradient id="clip-wire" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#f4f5f6" />
          <stop offset="0.5" stopColor="#b9bec5" />
          <stop offset="1" stopColor="#71767e" />
        </linearGradient>
      </defs>

      {/* gagang kawat */}
      <g stroke="url(#clip-wire)" strokeWidth="3.2" strokeLinecap="round">
        <path d="M25 25C13 21 8 10 18 5.5 26 2 34 9 34 21" />
        <path d="M47 25C59 21 64 10 54 5.5 46 2 38 9 38 21" />
      </g>

      {/* badan klip */}
      <path
        d="M21 23H51L47.5 49Q46.5 53 42 53H30Q25.5 53 24.5 49Z"
        fill="url(#clip-metal)"
        stroke="#6f757d"
        strokeWidth="1.2"
      />
      <path d="M23 26.6H49" stroke="#ffffff" strokeWidth="1.4" opacity="0.9" />
      <path d="M24 30.2H48" stroke="#5f656d" strokeWidth="1" opacity="0.45" />
      <path d="M26.5 46H45.5" stroke="#5f656d" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

