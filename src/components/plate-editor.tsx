"use client";

import { Plate, usePlateEditor } from "platejs/react";

import { EditorKit } from "@/components/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { UploadConfigProvider } from "@/lib/upload-config-context";

interface PlateEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  uploadBucket?: string;
  uploadFolder?: string;
}

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
  disabled = false,
  className,
  uploadBucket,
  uploadFolder,
}: PlateEditorProps) {
  const editorValue = parseEditorValue(value);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: editorValue,
  });

  return (
    <UploadConfigProvider bucket={uploadBucket} folder={uploadFolder}>
      <Plate
        editor={editor}
        onChange={({ value: newValue }) => {
          onChange?.(JSON.stringify(newValue));
        }}
      >
        <div className="relative overflow-x-scroll scrollbar-hide">
          <EditorContainer className={`border rounded-md ${className}`}>
            <Editor
              variant="fullWidth"
              placeholder={placeholder}
              disabled={disabled}
            />
          </EditorContainer>
        </div>
      </Plate>
    </UploadConfigProvider>
  );
}
