import prisma from "@/lib/prisma";

export function generateSlug(title: string) {
  const slug = title
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, "") // Remove non-word characters except spaces and hyphens
    .trim() // Trim spaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .slice(0, 50); // Limit to 50 characters
  return slug;
}

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
