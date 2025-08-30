import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Hook untuk memformat tanggal dengan date-fns
 * @param {string | number | Date} date - Tanggal yang ingin diformat
 * @param {"default" | "ago"} mode - Mode format: "default" untuk format biasa, "ago" untuk "x jam yang lalu"
 * @param {string} dateFormat - Format tanggal (hanya digunakan jika mode = "default")
 * @returns {string} - Hasil format tanggal
 */
export function useFormattedDate(
  date: string | number | Date | undefined,
  mode = "default",
  dateFormat = "dd MMMM yyyy"
) {
  if (!date) return "";

  try {
    const dateObj = new Date(date);

    if (mode === "ago") {
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: id,
      });
    }

    return format(dateObj, dateFormat, { locale: id });
  } catch (error) {
    console.error("Gagal memformat tanggal:", error);
    return "";
  }
}

export function formatCreatedUpdated(
  createdAt: string | number | Date,
  updatedAt?: string | number | Date
) {
  if (!createdAt) return "";

  try {
    const createdDate = format(new Date(createdAt), "d MMMM yyyy", {
      locale: id,
    });

    if (!updatedAt) return createdDate;

    const updatedDate = format(new Date(updatedAt), "d MMMM yyyy", {
      locale: id,
    });

    return `${createdDate} — Terakhir diperbarui ${updatedDate}`;
  } catch (error) {
    console.error("Gagal memformat tanggal:", error);
    return "";
  }
}
