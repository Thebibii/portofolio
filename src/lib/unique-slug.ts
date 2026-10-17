import { generateSlug } from "@/lib/genarate-slug";
import prisma from "@/lib/prisma";

/**
 * Membuat slug unik untuk Post.
 * - Normalisasi dengan generateSlug, fallback ke "post" bila kosong.
 * - Menambah suffix angka (-2, -3, ...) bila slug sudah dipakai.
 * - `currentSlug` dikecualikan agar slug milik post itu sendiri tidak dianggap bentrok saat update.
 */
export async function generateUniquePostSlug(
  source: string,
  currentSlug?: string
): Promise<string> {
  const base =
    generateSlug(source)
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "post";

  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { slug: true },
    });

    if (!existing || existing.slug === currentSlug) {
      return candidate;
    }

    counter += 1;
    candidate = `${base}-${counter}`;
  }
}
