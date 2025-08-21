"use client";

import { useState } from "react";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
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
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $createTextNode,
  $createParagraphNode,
  EditorState,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
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

// Enhanced style preservation utilities with improved font-family handling
interface StyledElement {
  text: string;
  styles: Record<string, string>;
  tagName: string;
  classes: string[];
  parentInfo?: unknown;
}

function parseStyles(styleString: string): Record<string, string> {
  const styles: Record<string, string> = {};
  if (!styleString) return styles;

  const declarations = styleString.split(";").filter(Boolean);
  declarations.forEach((decl) => {
    const [property, value] = decl.split(":").map((s) => s.trim());
    if (property && value) {
      styles[property] = value;
    }
  });

  return styles;
}

// Fixed: Improved stylesToString with proper font-family quote handling
function stylesToString(styles: Record<string, string>): string {
  return (
    Object.entries(styles)
      .map(([prop, value]) => {
        // Special handling for font-family to ensure proper quoting
        if (prop === "font-family") {
          // Remove existing quotes first
          let cleanValue = value.replace(/^["']|["']$/g, "");

          // If value contains spaces, wrap in single quotes to avoid HTML parsing issues
          if (cleanValue.includes(" ")) {
            return `${prop}: '${cleanValue}'`;
          }
          // If no spaces, no quotes needed
          return `${prop}: ${cleanValue}`;
        }
        return `${prop}: ${value}`;
      })
      .join("; ") + (Object.keys(styles).length > 0 ? ";" : "")
  );
}

// Fixed: Improved font-family extraction and preservation
function extractStyledElements(htmlString: string): StyledElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const styledElements: StyledElement[] = [];

  function extractFromElement(element: Element) {
    const styledEls = element.querySelectorAll("[style], [class]");

    styledEls.forEach((styledEl) => {
      const text = styledEl.textContent?.trim();
      if (!text) return;

      const styleAttr = styledEl.getAttribute("style") || "";
      const styles = parseStyles(styleAttr);
      const classes = Array.from(styledEl.classList);

      // Fixed: Preserve original font-family quotes from HTML
      if (styleAttr.includes("font-family:")) {
        const fontFamilyMatch = styleAttr.match(/font-family:\s*([^;]+)/);
        if (fontFamilyMatch) {
          styles["font-family"] = fontFamilyMatch[1].trim();
        }
      }

      if (Object.keys(styles).length > 0 || classes.length > 0) {
        const isDirectTextParent = Array.from(styledEl.childNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        );

        const existingIndex = styledElements.findIndex(
          (el) => el.text === text
        );
        const shouldAdd =
          existingIndex === -1 ||
          (isDirectTextParent && !styledElements[existingIndex].parentInfo);

        if (shouldAdd) {
          if (existingIndex !== -1) {
            styledElements.splice(existingIndex, 1);
          }

          styledElements.push({
            text,
            styles,
            tagName: styledEl.tagName.toLowerCase(),
            classes,
          });
        }
      }
    });
  }

  extractFromElement(doc.body);
  return styledElements;
}

function applyStylesToDOM(
  editorElement: HTMLElement,
  styledElements: StyledElement[]
) {
  styledElements.forEach(({ text, styles, classes }) => {
    const candidates = Array.from(editorElement.querySelectorAll("*"));
    const exactMatches = candidates.filter((element) => {
      const elementText = element.textContent?.trim();
      return elementText === text;
    });

    if (exactMatches.length === 0) return;

    let targetElement: Element | null = null;

    const spanWithDataAttr = exactMatches.find(
      (el) =>
        el.tagName.toLowerCase() === "span" &&
        el.hasAttribute("data-lexical-text")
    );

    if (spanWithDataAttr) {
      targetElement = spanWithDataAttr;
    } else {
      for (const element of exactMatches) {
        const hasDirectTextContent = Array.from(element.childNodes).some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        );

        if (hasDirectTextContent) {
          targetElement = element;
          break;
        }
      }

      if (!targetElement) {
        let maxDepth = 0;
        exactMatches.forEach((el) => {
          const depth = getElementDepth(el);
          if (depth > maxDepth) {
            maxDepth = depth;
            targetElement = el;
          }
        });
      }
    }

    if (!targetElement) return;

    if (Object.keys(styles).length > 0) {
      const currentStyle = targetElement.getAttribute("style") || "";
      const currentStyles = parseStyles(currentStyle);
      // Preserve existing styles and merge with new ones
      const mergedStyles = { ...styles, ...currentStyles };
      targetElement.setAttribute("style", stylesToString(mergedStyles));
    }

    if (classes.length > 0) {
      const nonConflictingClasses = classes.filter(
        (cls) =>
          !cls.includes("lexical") && !targetElement!.classList.contains(cls)
      );
      targetElement.classList.add(...nonConflictingClasses);
    }

    // Always mark as styled to preserve styles
    targetElement.classList.add("lexical-styled-text");

    // Store original styles in a data attribute for persistence
    targetElement.setAttribute("data-original-styles", JSON.stringify(styles));

    const parent = targetElement.parentElement;
    if (parent && parent !== editorElement) {
      const parentStyle = parent.getAttribute("style");
      if (parentStyle) {
        const parentStyles = parseStyles(parentStyle);
        const targetStyles = styles;

        Object.keys(targetStyles).forEach((prop) => {
          if (parentStyles[prop] === targetStyles[prop]) {
            delete parentStyles[prop];
          }
        });

        if (Object.keys(parentStyles).length > 0) {
          parent.setAttribute("style", stylesToString(parentStyles));
        } else {
          parent.removeAttribute("style");
        }
      }

      parent.classList.remove("lexical-styled-text");
    }
  });
}

function getElementDepth(element: Element): number {
  let depth = 0;
  let parent = element.parentElement;
  while (parent) {
    depth++;
    parent = parent.parentElement;
  }
  return depth;
}

function EnhancedInitialValuePlugin({
  initialValue,
}: {
  initialValue?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [hasSetInitialValue, setHasSetInitialValue] = useState(false);

  useEffect(() => {
    if (initialValue && !hasSetInitialValue) {
      const styledElements = extractStyledElements(initialValue);

      editor.update(() => {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialValue, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          const root = $getRoot();
          root.clear();
          if (nodes.length > 0) {
            root.append(...nodes);
          }
        } catch (error) {
          console.error("Error setting initial value:", error);
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(initialValue);
          paragraph.append(textNode);
          root.append(paragraph);
        }
      });

      if (styledElements.length > 0) {
        setTimeout(() => {
          const editorElement = editor.getRootElement();
          if (editorElement) {
            applyStylesToDOM(editorElement, styledElements);
          }
        }, 200);
      }

      setHasSetInitialValue(true);
    }
  }, [editor, initialValue, hasSetInitialValue]);

  return null;
}

// Fixed: Enhanced OnChange Plugin with improved font-family handling
function EnhancedOnChangePlugin({
  onChange,
}: {
  onChange: (html: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const baseHtml = $generateHtmlFromNodes(editor, null);
      const editorElement = editor.getRootElement();

      if (!editorElement) {
        onChange(baseHtml);
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(baseHtml, "text/html");

      const styledElements = editorElement.querySelectorAll(
        ".lexical-styled-text, [data-original-styles]"
      );

      const styledTextMap = new Map<
        string,
        { style: string; classes: string[] }
      >();

      styledElements.forEach((styledEl) => {
        const text = styledEl.textContent?.trim();
        const styleAttr = styledEl.getAttribute("style");
        const originalStyles = styledEl.getAttribute("data-original-styles");
        const classes = Array.from(styledEl.classList).filter(
          (c) => c !== "lexical-styled-text" && !c.includes("lexical")
        );

        if (!text) return;

        // Combine current styles with preserved original styles
        let allStyles: Record<string, string> = {};

        // First, add original styles if they exist
        if (originalStyles) {
          try {
            const parsed = JSON.parse(originalStyles);
            allStyles = { ...parsed };
          } catch (e) {
            // Fallback if JSON parsing fails
          }
        }

        // Then add current styles, which may override originals
        if (styleAttr) {
          const currentStyles = parseStyles(styleAttr);
          allStyles = { ...allStyles, ...currentStyles };
        }

        // Build the final style string
        let processedStyle = "";
        if (Object.keys(allStyles).length > 0) {
          processedStyle = stylesToString(allStyles);
        }

        styledTextMap.set(text, { style: processedStyle, classes });
      });

      styledTextMap.forEach(({ style, classes }, text) => {
        const allElements = Array.from(doc.querySelectorAll("*"));
        let targetElement: Element | null = null;

        const spanWithDataAttr = allElements.find(
          (el) =>
            el.textContent?.trim() === text &&
            el.tagName.toLowerCase() === "span" &&
            el.hasAttribute("data-lexical-text")
        );

        if (spanWithDataAttr) {
          targetElement = spanWithDataAttr;
        } else {
          const elementsWithText = allElements.filter(
            (el) => el.textContent?.trim() === text
          );

          for (const element of elementsWithText) {
            const hasDirectTextContent = Array.from(element.childNodes).some(
              (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
            );

            if (hasDirectTextContent) {
              targetElement = element;
              break;
            }
          }

          if (!targetElement && elementsWithText.length > 0) {
            targetElement = elementsWithText[elementsWithText.length - 1];
          }
        }

        if (targetElement) {
          if (style) {
            targetElement.setAttribute("style", style);
          }

          if (classes.length > 0) {
            targetElement.classList.add(...classes);
          }

          // Clean up lexical attributes and data attributes
          targetElement.removeAttribute("data-lexical-text");
          targetElement.removeAttribute("data-original-styles");

          const parent = targetElement.parentElement;
          if (parent) {
            const parentStyle = parent.getAttribute("style");
            if (parentStyle && style) {
              const parentStyles = parseStyles(parentStyle);
              const targetStyles = parseStyles(style);

              let hasChanges = false;
              Object.keys(targetStyles).forEach((prop) => {
                if (parentStyles[prop] === targetStyles[prop]) {
                  delete parentStyles[prop];
                  hasChanges = true;
                }
              });

              if (hasChanges) {
                if (Object.keys(parentStyles).length > 0) {
                  parent.setAttribute("style", stylesToString(parentStyles));
                } else {
                  parent.removeAttribute("style");
                }
              }
            }
          }
        }
      });

      // Fixed: Improved HTML cleanup with better quote handling and HTML entity prevention
      let finalHtml = doc.body.innerHTML;

      // Clean up HTML entities and attributes
      finalHtml = finalHtml
        .replace(/&quot;/g, '"')
        .replace(/&amp;(?![#a-zA-Z0-9]+;)/g, "&")
        .replace(/\s+class=""/g, "")
        .replace(/\s+style=""/g, "")
        .replace(/\s+class="lexical-styled-text"/g, "");

      // Fix malformed font-family attributes that got parsed as HTML attributes
      finalHtml = finalHtml.replace(
        /\s+(geist|mono|arial|times|helvetica)=""[^>]*>/gi,
        (match, fontPart) => {
          // This handles cases where font names got parsed as HTML attributes
          // Remove the malformed attributes and reconstruct the style
          const baseMatch = match.replace(/\s+\w+=""[^>]*/g, "");
          return baseMatch;
        }
      );

      // Ensure font-family values are properly formatted in final output
      finalHtml = finalHtml.replace(
        /style="([^"]*font-family:\s*)([^;"]*)([^"]*)"/,
        (match, before, fontName, after) => {
          let cleanFontName = fontName.trim();

          // Remove any existing quotes
          cleanFontName = cleanFontName.replace(/^["']|["']$/g, "");

          // If font name contains spaces, wrap in single quotes
          if (cleanFontName.includes(" ")) {
            return `style="${before}'${cleanFontName}'${after}"`;
          }

          return `style="${before}${cleanFontName}${after}"`;
        }
      );

      onChange(finalHtml);
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

interface RichTextEditorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  placeholder?: string;
  defaultValue?: string;
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
  defaultValue = "",
  disabled = false,
  className,
}: RichTextEditorProps<TFieldValues, TName>) {
  return (
    <div
      className={`bg-background w-full overflow-hidden rounded-lg border ${className}`}
    >
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue as any}
        render={({ field: { onChange, value } }) => (
          <LexicalComposer
            initialConfig={{
              ...editorConfig,
              editable: !disabled,
            }}
          >
            <TooltipProvider>
              <FloatingLinkContext>
                <EditorPlugins
                  placeholder={placeholder}
                  onChange={onChange}
                  value={value || ""}
                  disabled={disabled}
                />
              </FloatingLinkContext>
            </TooltipProvider>
          </LexicalComposer>
        )}
      />
    </div>
  );
}

interface EditorPluginsProps {
  placeholder: string;
  onChange: (value: string) => void;
  value: string;
  disabled: boolean;
}

function EditorPlugins({
  placeholder,
  onChange,
  value,
  disabled,
}: EditorPluginsProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="relative">
      <EnhancedInitialValuePlugin initialValue={value} />
      <EnhancedOnChangePlugin onChange={onChange} />

      {!disabled && (
        <ToolbarPlugin>
          {({ blockType }) => (
            <div className="vertical-align-middle sticky top-0 z-10 flex items-center gap-2 overflow-auto border-b p-1">
              <HistoryToolbarPlugin />
              <Separator orientation="vertical" className="!h-7" />
              <BlockFormatDropDown>
                <FormatHeading levels={["h1", "h2", "h3"]} />
                <FormatNumberedList />
                <FormatBulletedList />
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
                    disabled ? "cursor-not-allowed opacity-60" : ""
                  }`}
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
