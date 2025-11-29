"use client";

import { Plate, usePlateEditor, useEditorScrollRef } from "platejs/react";

import { EditorKit } from "@/components/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";

interface PlateEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
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

// Komponen yang menggunakan scroll ref
function EditorContent({
  placeholder,
  disabled,
}: {
  placeholder: string;
  disabled: boolean;
}) {
  const scrollRef = useEditorScrollRef();

  return (
    <div ref={scrollRef} className="h-[650px] overflow-y-auto">
      <EditorContainer className="border rounded-md h-full">
        <Editor
          variant="default"
          placeholder={placeholder}
          disabled={disabled}
        />
      </EditorContainer>
    </div>
  );
}

export function PlateEditor({
  value,
  onChange,
  placeholder = "Type...",
  disabled = false,
}: PlateEditorProps) {
  const editorValue = parseEditorValue(value);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: editorValue,
  });

  return (
    <Plate
      editor={editor}
      onChange={({ value: newValue }) => {
        onChange?.(JSON.stringify(newValue));
      }}
    >
      <EditorContent placeholder={placeholder} disabled={disabled} />
    </Plate>
  );
}
