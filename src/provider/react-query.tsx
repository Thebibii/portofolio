"use client";

import { getErrorStatus } from "@/lib/errors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid refetching immediately after SSR hydration.
        staleTime: 60 * 1000,
        // Unify the per-hook option that used to be repeated in guest hooks.
        refetchOnWindowFocus: false,
        // Do not retry client errors (401 included); retry transient failures
        // at most twice.
        retry: (failureCount, error) => {
          const status = getErrorStatus(error);
          if (status !== undefined && status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });

export const ReactQueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
