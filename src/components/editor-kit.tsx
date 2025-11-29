"use client";

import { type Value, TrailingBlockPlugin } from "platejs";
import { type TPlateEditor, useEditorRef } from "platejs/react";
import { BasicBlocksKit } from "./basic-blocks-kit";
import { CodeBlockKit } from "./code-block-kit";
import { BaseCalloutKit } from "./callout-base-kit";
import { BaseMentionKit } from "./mention-base-kit";
import { BasicMarksKit } from "./basic-marks-kit";
import { DiscussionKit } from "./discussion-kit";
import { CommentKit } from "./comment-kit";
import { SuggestionKit } from "./suggestion-kit";
import { MarkdownKit } from "./markdown-kit";
import { FixedToolbarKit } from "./fixed-toolbar-kit";
import { LinkKit } from "./link-kit";
import { ToggleKit } from "./toggle-kit";
import { ListKit } from "./list-kit";
import { ColumnKit } from "./column-kit";
import { DndKit } from "./dnd-kit";
import { AlignKit } from "./align-kit";
import { LineHeightKit } from "./line-height-kit";
import { BlockMenuKit } from "./block-menu-kit";
import { MathKit } from "./math-kit";
import { FontKit } from "./font-kit";
import { DateKit } from "./date-kit";
import { TocKit } from "./toc-kit";
import { ExitBreakKit } from "./exit-break-kit";
import { MediaKit } from "./media-kit";
import { TableKit } from "./table-kit";
import { FloatingToolbarKit } from "./floating-toolbar-kit";
import { BlockPlaceholderKit } from "./block-placeholder-kit";
import { DocxKit } from "./docx-kit";
import { AutoformatKit } from "./autoformat-kit";

export const EditorKit = [
  //   ...CopilotKit,
  //   ...AIKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...BaseCalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...BaseMentionKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  //   ...SlashKit,
  ...AutoformatKit,
  //   ...CursorOverlayKit,
  ...BlockMenuKit,
  ...DndKit,
  //   ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
