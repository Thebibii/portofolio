"use client";
import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// TODO(cleanup): kandidat penghapusan — menunggu konfirmasi pemakaian eksternal (K-3)
export const useGetDataHome = () => {
  return useQuery({
    queryKey: ["get.guest"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest`);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });
};

export const useGetDataAbout = (initialData?: unknown) => {
  return useQuery({
    queryKey: ["get.guest.about"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/about`);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    // Data dari Server Component dipakai sebagai isi awal (SEO + no spinner).
    initialData: initialData as any,
    // initialData berasal dari snapshot ISR yang bisa berumur sampai satu jam.
    // Tandai sudah usang supaya browser tetap ambil data baru saat mount.
    initialDataUpdatedAt: 0,
  });
};
