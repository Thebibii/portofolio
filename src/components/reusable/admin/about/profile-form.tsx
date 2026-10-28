"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

import { qk } from "@/lib/react-query/keys";
import { useUpdateAboutProfile } from "@/hooks/react-query/admin/about/use-profile";
import {
  ABOUT_TECH_STACK_KEYS,
  aboutProfileSchema,
  type AboutProfileInput,
} from "@/types/validation/about";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SingleImageUploader } from "@/components/ui/image-uploader";

type TechStackKey = (typeof ABOUT_TECH_STACK_KEYS)[number];

const TECH_STACK_LABELS: Record<TechStackKey, string> = {
  nextjs: "Next.js",
  nodejs: "Node.js",
  typescript: "TypeScript",
  tailwind: "Tailwind CSS",
  react: "React",
  vercel: "Vercel",
};

const MAX_PARAGRAPHS = 10;

/** Dipakai kalau profil di database belum pernah disimpan. */
const FALLBACK_PROFILE: AboutProfileInput = {
  name: "Habibie Bayezid Wildan",
  nickname: "Bibi",
  role: "",
  location: "",
  paragraphs: [
    "Sehari-hari saya membangun antarmuka web dengan React dan ekosistem di sekitarnya dari halaman sederhana sampai dashboard yang penuh data.",
    "Semua ini berawal dari rasa penasaran. Dulu saya hobi membongkar situs orang lain lewat inspect element, mengubah-ubah warnanya, lalu mencoba membangun versi saya sendiri. Ternyata rasa penasaran itu yang akhirnya jadi pekerjaan.",
    "Saya menulis karena menulis memaksa saya berpikir lebih jernih. Saat mencoba menjelaskan satu konsep dengan bahasa sederhana, saya sering baru sadar bagian mana yang sebenarnya belum saya pahami.",
    "Sekarang saya lebih banyak berada di antara desain dan engineering: menerjemahkan ide jadi layar yang enak dipakai, lalu memastikan semuanya tetap rapi di balik layar.",
  ],
  stackLine:
    "Saya juga seorang full-stack engineer, berikut tech stack favorit saya saat ini:",
  photoUrl: "",
  techStack: [...ABOUT_TECH_STACK_KEYS],
};

const isTechStackKey = (value: string): value is TechStackKey =>
  (ABOUT_TECH_STACK_KEYS as readonly string[]).includes(value);

/** Bentuk minimal yang dibaca dari respons profil (kompatibel dengan Prisma). */
type ProfileSource = {
  name?: string | null;
  nickname?: string | null;
  role?: string | null;
  location?: string | null;
  paragraphs?: string[] | null;
  stackLine?: string | null;
  photoUrl?: string | null;
  techStack?: string[] | null;
};

type ProfileFormProps = {
  profile?: ProfileSource | null;
};

export default function ProfileForm({ profile }: ProfileFormProps) {
  const queryClient = useQueryClient();

  const values = useMemo<AboutProfileInput>(() => {
    if (!profile) return FALLBACK_PROFILE;

    return {
      name: profile.name ?? FALLBACK_PROFILE.name,
      nickname: profile.nickname ?? FALLBACK_PROFILE.nickname,
      role: profile.role ?? "",
      location: profile.location ?? "",
      paragraphs: profile.paragraphs?.length
        ? profile.paragraphs
        : FALLBACK_PROFILE.paragraphs,
      stackLine: profile.stackLine?.trim()
        ? profile.stackLine
        : FALLBACK_PROFILE.stackLine,
      photoUrl: profile.photoUrl ?? "",
      techStack: (profile.techStack ?? []).filter(isTechStackKey),
    };
  }, [profile]);

  const form = useForm<AboutProfileInput>({
    resolver: zodResolver(aboutProfileSchema) as Resolver<AboutProfileInput>,
    values,
  });

  // Paragraphs adalah array of string, jadi dikelola lewat watch/setValue
  // (useFieldArray hanya mendukung array of object).
  const paragraphs = form.watch("paragraphs") ?? [];

  const updateParagraph = (index: number, value: string) => {
    const next = [...paragraphs];
    next[index] = value;
    form.setValue("paragraphs", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addParagraph = () => {
    if (paragraphs.length >= MAX_PARAGRAPHS) return;
    form.setValue("paragraphs", [...paragraphs, ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeParagraph = (index: number) => {
    form.setValue(
      "paragraphs",
      paragraphs.filter((_, position) => position !== index),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const { mutate, isPending } = useUpdateAboutProfile({
    onSuccess: (body) => {
      toast.success("Perubahan tersimpan", {
        description:
          body.message ?? "Hero profile di halaman /about sudah diperbarui.",
      });
      queryClient.invalidateQueries({ queryKey: qk.admin.aboutProfile });
      queryClient.invalidateQueries({ queryKey: qk.guest.about });
    },
    onError: (error: Error) => {
      toast.error("Gagal menyimpan", {
        description: error?.message || "Terjadi kesalahan yang tidak diketahui",
      });
    },
  });

  const selectedTechStack = form.watch("techStack") ?? [];
  const canAddParagraph = paragraphs.length < MAX_PARAGRAPHS;

  const toggleTechStack = (key: TechStackKey, checked: boolean) => {
    const next = new Set<TechStackKey>(selectedTechStack);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }

    form.setValue(
      "techStack",
      ABOUT_TECH_STACK_KEYS.filter((candidate) => next.has(candidate)),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const onSubmit = form.handleSubmit((data) => {
    mutate({
      ...data,
      role: data.role?.trim() ? data.role : null,
      location: data.location?.trim() ? data.location : null,
      photoUrl: data.photoUrl ? data.photoUrl : null,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identitas</CardTitle>
            <CardDescription>
              Nama, peran, dan foto yang tampil paling atas di halaman /about.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama lengkap</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Habibie Bayezid Wildan"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama panggilan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bibi"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dipakai pada sapaan &ldquo;Halo, saya ...&rdquo;.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role/peran</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Web Developer"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Opsional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Padang Panjang, Indonesia"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Opsional.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>Foto</FormLabel>
                  <FormControl>
                    <SingleImageUploader
                      value={field.value ?? ""}
                      onChange={(url) => field.onChange(url ? url : null)}
                      onRemove={() => field.onChange(null)}
                      bucket="profile"
                      folder="about"
                      placeholder="Upload foto profil"
                    />
                  </FormControl>
                  <FormDescription>
                    Unggah foto potret (JPG, PNG, atau WEBP, maksimal 5MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Cerita</CardTitle>
              <CardDescription>
                Paragraf perkenalan, ditampilkan berurutan di bawah sapaan.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addParagraph}
              disabled={!canAddParagraph || isPending}
            >
              <Plus className="size-4" />
              Tambah paragraf
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {paragraphs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada paragraf. Tambahkan minimal satu paragraf untuk
                halaman /about.
              </div>
            ) : (
              paragraphs.map((paragraph, index) => {
                const error = form.formState.errors.paragraphs?.[index];

                return (
                  <FormItem key={index}>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel className="text-muted-foreground">
                        Paragraf {index + 1}
                      </FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeParagraph(index)}
                        disabled={isPending}
                        aria-label={`Hapus paragraf ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <Textarea
                      rows={4}
                      className="resize-y"
                      placeholder="Tulis satu paragraf cerita..."
                      value={paragraph}
                      onChange={(event) =>
                        updateParagraph(index, event.target.value)
                      }
                    />
                    {error?.message && (
                      <p className="text-sm text-destructive">{error.message}</p>
                    )}
                  </FormItem>
                );
              })
            )}

            <p className="text-xs text-muted-foreground">
              {paragraphs.length}/{MAX_PARAGRAPHS} paragraf. Setiap paragraf
              maksimal 1.200 karakter.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech stack</CardTitle>
            <CardDescription>
              Kalimat pengantar dan logo teknologi favorit di bagian bawah hero.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="stackLine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kalimat pengantar tech stack</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Saya juga seorang full-stack engineer, berikut tech stack favorit saya saat ini:"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techStack"
              render={() => (
                <FormItem>
                  <FormLabel>Teknologi</FormLabel>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ABOUT_TECH_STACK_KEYS.map((key) => {
                      const checked = selectedTechStack.includes(key);
                      const id = `tech-stack-${key}`;

                      return (
                        <label
                          key={key}
                          htmlFor={id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5"
                        >
                          <Checkbox
                            id={id}
                            checked={checked}
                            onCheckedChange={(value) =>
                              toggleTechStack(key, value === true)
                            }
                            disabled={isPending}
                          />
                          <span className="font-medium">
                            {TECH_STACK_LABELS[key]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <FormDescription>
                    Urutan logo mengikuti daftar di atas. Kosongkan semua untuk
                    menampilkan enam logo bawaan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Perubahan langsung tampil di halaman /about setelah disimpan.
          </p>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isPending ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
