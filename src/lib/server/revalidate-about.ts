import "server-only";
import { revalidatePath } from "next/cache";

/**
 * /about memakai ISR `revalidate = 3600` dan menyerahkan snapshot build ke
 * server component sebagai `initialData`. Tanpa panggilan ini, perubahan dari
 * admin baru terlihat setelah cache satu jam habis.
 */
export function revalidateAboutPage() {
  revalidatePath("/about");
}
