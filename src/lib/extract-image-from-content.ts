import { deleteMultipleImages } from "./imageUpload";

export function parseImageUrl(
  url: string
): { bucket: string; path: string } | null {
  try {
    const match = url.match(
      /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
    );
    if (!match) return null;
    return { bucket: match[1], path: match[2] };
  } catch {
    return null;
  }
}

export function extractImagesFromContent(
  contentJson: string
): Array<{ url: string; bucket: string; path: string }> {
  try {
    const nodes = JSON.parse(contentJson);
    const images: Array<{ url: string; bucket: string; path: string }> = [];

    function traverse(node: unknown) {
      if (!node || typeof node !== "object") return;

      if (Array.isArray(node)) {
        node.forEach(traverse);
        return;
      }

      const obj = node as Record<string, unknown>;

      if (
        typeof obj.url === "string" &&
        obj.url.includes("supabase")
      ) {
        const parsed = parseImageUrl(obj.url);
        if (parsed) {
          images.push({ url: obj.url, ...parsed });
        }
      }

      if (Array.isArray(obj.children)) {
        obj.children.forEach(traverse);
      }
    }

    traverse(nodes);
    return images;
  } catch {
    return [];
  }
}

export async function deleteImagesFromContent(
  contentJson: string
): Promise<void> {
  const images = extractImagesFromContent(contentJson);

  const grouped = images.reduce<Record<string, string[]>>((acc, img) => {
    if (!acc[img.bucket]) acc[img.bucket] = [];
    acc[img.bucket].push(img.path);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(grouped).map(([bucket, paths]) =>
      deleteMultipleImages(paths, bucket)
    )
  );
}
