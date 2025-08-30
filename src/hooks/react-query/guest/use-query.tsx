"use client";
import { baseURL } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetDataHome = () => {
  return useQuery({
    queryKey: ["get.guest"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest`);

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useGetDataAbout = () => {
  return useQuery({
    queryKey: ["get.guest"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/guest/about`);

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    refetchOnWindowFocus: false,
  });
};
