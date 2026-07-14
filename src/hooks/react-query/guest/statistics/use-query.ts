"use client";
import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGuestStatistics = () => {
  return useQuery({
    queryKey: ["get.guest.statistics"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/statistics`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
