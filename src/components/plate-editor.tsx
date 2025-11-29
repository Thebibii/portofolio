"use client";

import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";

interface PlateEditorProps {
  value?: string; // JSON string dari react-hook-form
  onChange?: (value: string) => void; // Mengirim JSON string
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Helper function untuk parse value
function parseEditorValue(value?: string) {
  if (!value) {
    return [{ type: "p", children: [{ text: "" }] }];
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Error parsing editor value:", error);
    return [{ type: "p", children: [{ text: "" }] }];
  }
}

export function PlateEditor({
  value,
  onChange,
  placeholder = "Type...",
  className = "h-[650px] overflow-y-auto",
  disabled = false,
}: PlateEditorProps) {
  // Parse string JSON menjadi array untuk editor
  const editorValue = parseEditorValue(value);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: editorValue,
  });

  return (
    <Plate
      editor={editor}
      onChange={({ value: newValue }) => {
        // Convert array kembali ke JSON string untuk react-hook-form
        onChange?.(JSON.stringify(newValue));
      }}
    >
      <EditorContainer className="border rounded-md h-full">
        <Editor
          variant="default"
          className={className}
          placeholder={placeholder}
          disabled={disabled}
        />
      </EditorContainer>
    </Plate>
  );
}
