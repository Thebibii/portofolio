"use client";

import React from "react";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";
type TProps = {
  children: React.ReactNode;
};

const ProgressBarProvider: React.FC<TProps> = ({ children }) => {
  return (
    <ProgressProvider
      height="2px"
      color="#E4004B"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export default ProgressBarProvider;
