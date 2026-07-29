"use client";

import * as React from "react";

interface UploadConfig {
  bucket: string;
  folder: string;
}

const UploadConfigContext = React.createContext<UploadConfig>({
  bucket: "projects",
  folder: "description",
});

export function UploadConfigProvider({
  children,
  bucket,
  folder,
}: React.PropsWithChildren<{
  bucket?: string;
  folder?: string;
}>) {
  const resolvedBucket = bucket ?? "projects";
  const resolvedFolder = folder ?? "description";
  const value = React.useMemo(
    () => ({ bucket: resolvedBucket, folder: resolvedFolder }),
    [resolvedBucket, resolvedFolder]
  );

  return (
    <UploadConfigContext.Provider value={value}>
      {children}
    </UploadConfigContext.Provider>
  );
}

export function useUploadConfig(): UploadConfig {
  return React.useContext(UploadConfigContext);
}
