"use client";

import { createPlatePlugin } from "platejs/react";

import { FixedToolbarButtons } from "@/components/ui/fixed-toolbar-buttons";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";

export const FixedToolbarKit = [
  createPlatePlugin({
    key: "fixed-toolbar",
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
