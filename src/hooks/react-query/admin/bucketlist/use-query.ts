import { baseURL } from "@/lib/api";
import { qk } from "@/lib/react-query/keys";
import type { BucketItemData } from "@/types/bucketlist";
import { useQuery } from "@tanstack/react-query";

export const useAdminBucketlist = () => {
  return useQuery({
    queryKey: qk.admin.bucketlist,
    queryFn: async () => {
      const res = await fetch(`${baseURL}/admin/bucketlist`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error("Gagal memuat daftar impian");
      return data as { success: boolean; data: BucketItemData[] };
    },
  });
};
