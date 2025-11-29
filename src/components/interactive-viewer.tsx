"use client";

import { PlateView, usePlateViewEditor } from "platejs/react";
import { BaseEditorKit } from "./editor-base-kit";

export function InteractiveViewer({ value }: any) {
  const editor = usePlateViewEditor({
    plugins: BaseEditorKit,
    value,
  });

  return <PlateView editor={editor} />;
}
