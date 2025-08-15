"use client";

import { useState, useEffect } from "react";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ParagraphNode, TextNode, ElementNode, LexicalNode } from "lexical";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $insertNodes,
  EditorState,
  $createTextNode,
  $createParagraphNode,
} from "lexical";
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
import {
  parseHtmlWithStyles,
  StyledSpanNode,
} from "./editor/nodes/styled-span-font";

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
    StyledSpanNode, // 🎯 Add our custom node!
  ],
  onError: (error: Error) => {
    console.error(error);
  },
};

// Plugin untuk menangani perubahan nilai dan sinkronisasi dengan React Hook Form
function ReactHookFormPlugin({
  onChange,
  onBlur,
  initialValue,
}: {
  onChange: (html: string) => void;
  onBlur?: () => void;
  initialValue?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (initialValue && isFirstRender) {
      editor.update(() => {
        console.log("🚀 Loading initial value:", initialValue);

        // 🔧 Gunakan custom parser untuk preserve styled spans
        const nodes = parseHtmlWithStyles(initialValue);

        console.log("🏗️ Created nodes:", nodes);

        $getRoot().select();
        $getRoot().clear();
        $insertNodes(nodes);

        console.log("✅ Nodes inserted successfully");
      });
      setIsFirstRender(false);
    }
  }, [editor, initialValue, isFirstRender]);

  useEffect(() => {
    if (!onBlur) return;

    const removeListener = editor.registerRootListener(
      (rootElement, prevRootElement) => {
        if (prevRootElement !== null) {
          prevRootElement.removeEventListener("blur", onBlur);
        }
        if (rootElement !== null) {
          rootElement.addEventListener("blur", onBlur);
        }
      }
    );

    return () => {
      removeListener();
    };
  }, [editor, onBlur]);

  const handleEditorChange = (editorState: EditorState) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor);
      console.log("📤 Final HTML output:", htmlString);
      onChange(htmlString);
    });
  };

  return <OnChangePlugin onChange={handleEditorChange} />;
}

// Props untuk RichTextEditor yang terintegrasi dengan React Hook Form
interface RichTextEditorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  placeholder = "Start typing...",
  disabled = false,
  className,
}: RichTextEditorProps<TFieldValues, TName>) {
  const {
    field: { onChange, value, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div
      className={`bg-background w-full overflow-hidden rounded-lg border ${
        className || ""
      } ${error ? "border-destructive" : ""}`}
    >
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editable: !disabled,
        }}
      >
        <TooltipProvider>
          <FloatingLinkContext>
            <Plugins
              placeholder={placeholder}
              onChange={onChange}
              onBlur={onBlur}
              initialValue={value}
              disabled={disabled}
            />
          </FloatingLinkContext>
        </TooltipProvider>
      </LexicalComposer>
      {error && (
        <p className="text-sm font-medium text-destructive mt-1 px-2">
          {error.message}
        </p>
      )}
    </div>
  );
}

interface PluginsProps {
  placeholder: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  initialValue?: string;
  disabled?: boolean;
}

function Plugins({
  placeholder,
  onChange,
  onBlur,
  initialValue,
  disabled,
}: PluginsProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      {!disabled && (
        <ToolbarPlugin>
          {({ blockType }) => (
            <div className="vertical-align-middle sticky top-0 z-10 flex items-center gap-2 overflow-auto border-b p-1">
              <HistoryToolbarPlugin />
              <Separator orientation="vertical" className="!h-7" />
              <BlockFormatDropDown>
                <FormatHeading levels={["h1", "h2", "h3"]} />
                <FormatNumberedList />
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
      )}

      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
              <div className="" ref={onRef}>
                <ContentEditable
                  placeholder={placeholder}
                  className={`ContentEditable__root relative block h-72 min-h-72 min-h-full overflow-auto px-8 py-4 focus:outline-none ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <ReactHookFormPlugin
          onChange={onChange}
          onBlur={onBlur}
          initialValue={initialValue}
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

        {!disabled && (
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
                </>
              </div>
            </div>
          </ActionsPlugin>
        )}
      </div>
    </div>
  );
}

// Export helper functions
