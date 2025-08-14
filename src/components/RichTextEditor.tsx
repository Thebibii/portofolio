"use client";

import { useState } from "react";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ParagraphNode, TextNode } from "lexical";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { TooltipProvider } from "@/components/ui/tooltip";
import { editorTheme } from "./editor/themes/editor-theme";
import { ToolbarPlugin } from "./editor/plugins/toolbar/toolbar-plugin";
import { HistoryToolbarPlugin } from "./editor/plugins/toolbar/history-toolbar-plugin";
import { ContentEditable } from "./editor/editor-ui/content-editable";
import { FontSizeToolbarPlugin } from "./editor/plugins/toolbar/font-size-toolbar-plugin";
import { Separator } from "./ui/separator";
import { FontFamilyToolbarPlugin } from "./editor/plugins/toolbar/font-family-toolbar-plugin";
import { FontFormatToolbarPlugin } from "./editor/plugins/toolbar/font-format-toolbar-plugin";
import { SubSuperToolbarPlugin } from "./editor/plugins/toolbar/subsuper-toolbar-plugin";
import { FontColorToolbarPlugin } from "./editor/plugins/toolbar/font-color-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "./editor/plugins/toolbar/font-background-toolbar-plugin";
import { BlockFormatDropDown } from "./editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatCodeBlock } from "./editor/plugins/toolbar/block-format/format-code-block";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { CodeActionMenuPlugin } from "./editor/plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "./editor/plugins/code-highlight-plugin";
import { ClearFormattingToolbarPlugin } from "./editor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { ActionsPlugin } from "./editor/plugins/actions/actions-plugin";
import { ClearEditorActionPlugin } from "./editor/plugins/actions/clear-editor-plugin";
import { CounterCharacterPlugin } from "./editor/plugins/actions/counter-character-plugin";
import { EditModeTogglePlugin } from "./editor/plugins/actions/edit-mode-toggle-plugin";
import { SpeechToTextPlugin } from "./editor/plugins/actions/speech-to-text-plugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkPlugin } from "./editor/plugins/link-plugin";
import { FormatHeading } from "./editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "./editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatQuote } from "./editor/plugins/toolbar/block-format/format-quote";
import { FormatBulletedList } from "./editor/plugins/toolbar/block-format/format-bulleted-list";
import { AutoEmbedPlugin } from "./editor/plugins/embeds/auto-embed-plugin";
import { FigmaPlugin } from "./editor/plugins/embeds/figma-plugin";
import { TwitterPlugin } from "./editor/plugins/embeds/twitter-plugin";
import { YouTubePlugin } from "./editor/plugins/embeds/youtube-plugin";
import { BlockInsertPlugin } from "./editor/plugins/toolbar/block-insert-plugin";
import { InsertEmbeds } from "./editor/plugins/toolbar/block-insert/insert-embeds";
import { FigmaNode } from "./editor/nodes/embeds/figma-node";
import { TweetNode } from "./editor/nodes/embeds/tweet-node";
import { YouTubeNode } from "./editor/nodes/embeds/youtube-node";
import { FloatingLinkEditorPlugin } from "./editor/plugins/floating-link-editor-plugin";
import { FloatingLinkContext } from "./editor/context/floating-link-context";
import { LinkToolbarPlugin } from "./editor/plugins/toolbar/link-toolbar-plugin";
import { AutoLinkPlugin } from "./editor/plugins/auto-link-plugin";
import { ElementFormatToolbarPlugin } from "./editor/plugins/toolbar/element-format-toolbar-plugin";
import { MarkdownTogglePlugin } from "./editor/plugins/actions/markdown-toggle-plugin";
import { CodeLanguageToolbarPlugin } from "./editor/plugins/toolbar/code-language-toolbar-plugin";
import { CodeHighlightNode, CodeNode } from "@lexical/code";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes: [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    FigmaNode,
    TweetNode,
    YouTubeNode,
    CodeNode,
    CodeHighlightNode,
  ],
  onError: (error: Error) => {
    console.error(error);
  },
};

export function RichTextEditorDemo() {
  return (
    <div className="bg-background w-full overflow-hidden rounded-lg border">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
        }}
      >
        <TooltipProvider>
          <FloatingLinkContext>
            <Plugins />
          </FloatingLinkContext>
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

const placeholder = "Start typing...";

export function Plugins() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {/* toolbar plugins */}
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="vertical-align-middle sticky top-0 z-10 flex items-center gap-2 overflow-auto border-b p-1">
            <HistoryToolbarPlugin />
            <Separator orientation="vertical" className="!h-7" />
            <BlockFormatDropDown>
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              {/* <FormatBulletedList /> */}
              <FormatCodeBlock />
              <FormatQuote />
            </BlockFormatDropDown>
            {blockType === "code" ? <CodeLanguageToolbarPlugin /> : <></>}
            <FontFamilyToolbarPlugin />
            <FontSizeToolbarPlugin />
            <Separator orientation="vertical" className="!h-7" />
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <FontFormatToolbarPlugin format="underline" />
            <FontFormatToolbarPlugin format="strikethrough" />
            <Separator orientation="vertical" className="!h-7" />
            <SubSuperToolbarPlugin />
            <LinkToolbarPlugin />
            <Separator orientation="vertical" className="!h-7" />
            <ClearFormattingToolbarPlugin />
            <Separator orientation="vertical" className="!h-7" />
            <FontColorToolbarPlugin />
            <FontBackgroundToolbarPlugin />
            <Separator orientation="vertical" className="!h-7" />
            <ElementFormatToolbarPlugin />
            <Separator orientation="vertical" className="!h-7" />
            <BlockInsertPlugin>
              <InsertEmbeds />
            </BlockInsertPlugin>
          </div>
        )}
      </ToolbarPlugin>

      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={placeholder}
                  className="ContentEditable__root relative block h-72 min-h-72 min-h-full overflow-auto px-8 py-4 focus:outline-none"
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <ClickableLinkPlugin />

        <AutoEmbedPlugin />
        <FigmaPlugin />
        <TwitterPlugin />
        <YouTubePlugin />
        <AutoLinkPlugin />
        <LinkPlugin />
        <TabIndentationPlugin />
        <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
        <CodeHighlightPlugin />
        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
        {/* rest of the plugins */}
        <ActionsPlugin>
          <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
            <div className="flex flex-1 justify-start">
              {/* left side action buttons */}
            </div>
            <div>
              {/* center action buttons */}
              <CounterCharacterPlugin charset="UTF-16" />
            </div>
            <div className="flex flex-1 justify-end">
              {/* right side action buttons */}
              <>
                <EditModeTogglePlugin />
                <ClearEditorActionPlugin />
                <ClearEditorPlugin />
                <SpeechToTextPlugin />
                <MarkdownTogglePlugin shouldPreserveNewLinesInMarkdown={true} />
              </>
            </div>
          </div>
        </ActionsPlugin>
      </div>
    </div>
  );
}
