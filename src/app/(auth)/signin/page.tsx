// app/(auth)/signin/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

/**
 * Isi panel identitas. Dipakai di dua tempat: panel gelap (lg+) dan
 * ringkasan kecil di atas form (mobile), supaya identitas selalu hadir
 * tanpa menduplikasi teks di satu breakpoint yang sama.
 */
const identity = {
  wordmark: "The Bibi",
  descriptor: "Portofolio & catatan",
  name: "Habibie Bayezid Wildan",
  quote:
    "Saya menulis untuk berpikir lebih jernih, lalu membangun antarmuka supaya orang lain tidak perlu berpikir dua kali.",
};

/**
 * Satu-satunya pesan error untuk kredensial salah, dipakai juga untuk
 * menandai input sebagai tidak valid. Pesan lockout dibuat di dalam
 * handleSubmit karena membawa sisa menit dari server.
 */
const CREDENTIALS_ERROR = "Email atau kata sandi salah.";

/** Entrance ringan, CSS murni supaya halaman sudah terbaca sebelum hydrate. */
const enter =
  "animate-in fade-in duration-500 fill-mode-both motion-reduce:animate-none";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const hasError = error.length > 0;
  const isCredentialsError = error === CREDENTIALS_ERROR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.startsWith("LOCKOUT:")) {
          const minutes = result.error.split(":")[1];
          setError(`Akses terkunci sementara. Coba lagi dalam ${minutes} menit.`);
        } else {
          setError(CREDENTIALS_ERROR);
        }
      } else {
        router.push("/admin/dashboard"); // Redirect ke dashboard atau halaman utama
        router.refresh();
      }
    } catch {
      setError("Gagal masuk. Coba lagi sebentar lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[1.08fr_1fr]">
      {/*
        Panel identitas. Sengaja tetap gelap di kedua tema supaya terasa
        seperti "sampul" — teksnya selalu terang di atas neutral gelap,
        jadi kontras aman tanpa bergantung pada token tema.
      */}
      <aside className="relative hidden overflow-hidden border-r border-neutral-800/80 bg-neutral-950 text-neutral-50 lg:flex lg:flex-col dark:border-white/10 dark:bg-neutral-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col p-10 xl:p-14">
          <span className="text-[11px] tracking-[0.3em] uppercase text-neutral-200">
            {identity.wordmark}
          </span>

          <div className="mt-auto">
            <div className="w-fit -rotate-2 bg-neutral-800 p-2 ring-1 ring-white/15 shadow-[0_18px_35px_-22px_rgba(0,0,0,0.9)]">
              <Image
                src="/profile.png"
                alt={`Foto ${identity.name}`}
                width={240}
                height={294}
                priority
                className="h-36 w-[120px] object-cover object-center"
              />
            </div>

            <p className="mt-8 max-w-[36ch] text-[15px] leading-[1.75] text-pretty text-neutral-100">
              {identity.quote}
            </p>
          </div>

          <div className="mt-12 border-t border-white/10 pt-5 text-[11px] tracking-[0.16em] uppercase text-neutral-400">
            {identity.descriptor}
          </div>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col bg-background">
        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className={`w-full max-w-[360px] ${enter}`}>
            {/* Identitas versi mobile: panel kiri disembunyikan di bawah lg. */}
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="shrink-0 border border-border bg-muted p-1">
                <Image
                  src="/profile.png"
                  alt={`Foto ${identity.name}`}
                  width={64}
                  height={80}
                  className="h-10 w-8 object-cover object-center"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {identity.wordmark}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {identity.descriptor}
                </p>
              </div>
            </div>

            <div>
              <h1 className="text-[1.65rem] leading-[1.15] font-semibold tracking-tight sm:text-3xl">
                Masuk ke panel
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Ruang kerja saya untuk mengelola projek, blog, dan tulisan.
              </p>
            </div>

            {/*
              Slot status berukuran tetap: pesan error muncul di ruang yang
              sudah disiapkan, jadi tidak ada form yang bergeser naik-turun.
              min-h-10 = dua baris teks 12px, cukup untuk pesan lockout.
            */}
            <div
              id="signin-status"
              role="status"
              aria-live="polite"
              className="mt-2 min-h-10"
            >
              {hasError && (
                <p className="flex items-start gap-2 text-xs leading-5 text-destructive">
                  <Icons.AlertTriangle
                    className="mt-px size-3.5 shrink-0"
                    aria-hidden
                  />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[13px] tracking-wide text-foreground/80"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-invalid={isCredentialsError || undefined}
                  aria-describedby={hasError ? "signin-status" : undefined}
                  className="h-10 bg-background dark:bg-input/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[13px] tracking-wide text-foreground/80"
                >
                  Kata sandi
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-invalid={isCredentialsError || undefined}
                  aria-describedby={hasError ? "signin-status" : undefined}
                  className="h-10 bg-background dark:bg-input/20"
                />
              </div>

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.Loader className="size-4 animate-spin" aria-hidden />
                )}
                {isLoading ? "Memeriksa…" : "Masuk"}
              </Button>
            </form>

            <div className="mt-7 border-t border-border/80 pt-5">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Khusus pemilik situs. Tidak ada pendaftaran publik.
              </p>
              <Link
                href="/"
                className="group mt-3 inline-flex items-center gap-1 rounded-sm text-xs text-foreground/75 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                <Icons.ChevronLeft
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none"
                  aria-hidden
                />
                Kembali ke situs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
