import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getRoot,
  $insertNodes,
  EditorState,
  $createTextNode,
  $createParagraphNode,
  ElementNode,
  LexicalNode,
} from "lexical";

// 🔧 PERBAIKAN UTAMA: Custom Span Node yang bisa menyimpan arbitrary styles

class StyledSpanNode extends ElementNode {
  __styles: Record<string, string>;

  static getType(): string {
    return "styled-span";
  }

  static clone(node: StyledSpanNode): StyledSpanNode {
    return new StyledSpanNode(node.__styles, node.__key);
  }

  constructor(styles: Record<string, string> = {}, key?: string) {
    super(key);
    this.__styles = styles;
  }

  isInline(): boolean {
    return true;
  }

  // 🎯 PENTING: Override canInsertTextBefore dan canInsertTextAfter
  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  // 🎯 PENTING: Override canBeEmpty untuk mencegah merge otomatis
  canBeEmpty(): boolean {
    return false;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    this.applyStylesToElement(span);
    console.log("🏗️ Created DOM with styles:", this.__styles);
    console.log("🏗️ Applied to element:", span.outerHTML);
    return span;
  }

  updateDOM(prevNode: StyledSpanNode, dom: HTMLElement): boolean {
    // Clear all previous styles first
    dom.removeAttribute("style");

    // Apply current styles
    this.applyStylesToElement(dom);

    console.log("🔄 Updated DOM with styles:", this.__styles);
    return false;
  }

  // 🔧 Helper method untuk apply styles dengan konsisten
  private applyStylesToElement(element: HTMLElement): void {
    // Clear any existing inline styles first
    element.removeAttribute("style");

    Object.entries(this.__styles).forEach(([property, value]) => {
      try {
        if (property === "font-family") {
          console.log(`🎯 Applying font-family: "${value}"`);

          // Multiple approaches to ensure font-family is applied

          // Method 1: Standard setProperty
          element.style.setProperty(property, value, "important");

          // Method 2: Direct assignment as backup
          (element.style as any).fontFamily = value;

          // Method 3: setAttribute as final backup
          const currentStyle = element.getAttribute("style") || "";
          if (!currentStyle.includes("font-family")) {
            element.setAttribute(
              "style",
              `${currentStyle}; font-family: ${value} !important;`.trim()
            );
          }

          // Verify application
          const appliedValue = window.getComputedStyle(element).fontFamily;
          console.log(`🔍 Applied font-family: "${appliedValue}"`);
          console.log(`🔍 Element style: "${element.style.cssText}"`);
        } else {
          element.style.setProperty(property, value);
          console.log(`🎯 Applied ${property}: ${value}`);
        }
      } catch (error) {
        console.error(`❌ Failed to apply style ${property}: ${value}`, error);
      }
    });

    console.log(`🔍 Final element outerHTML: ${element.outerHTML}`);
  }

  exportDOM(): { element: HTMLElement } {
    const element = document.createElement("span");
    this.applyStylesToElement(element);
    console.log("📤 Exported DOM:", element.outerHTML);
    return { element };
  }

  exportJSON(): any {
    return {
      ...super.exportJSON(),
      styles: this.__styles,
      type: "styled-span",
      version: 1,
    };
  }

  static importJSON(serializedNode: any): StyledSpanNode {
    const { styles } = serializedNode;
    return new StyledSpanNode(styles || {});
  }

  // 🔧 PENTING: Implement static importDOM untuk HTML parsing
  static importDOM(): Record<string, any> | null {
    return {
      span: (domNode: HTMLElement) => {
        const style = domNode.getAttribute("style");
        if (!style) {
          return null;
        }

        return {
          conversion: (element: HTMLElement) => {
            const styles: Record<string, string> = {};
            const styleText = element.getAttribute("style") || "";

            // Parse CSS styles
            styleText.split(";").forEach((rule) => {
              const [property, value] = rule.split(":").map((s) => s.trim());
              if (property && value) {
                let cleanValue = value.trim();

                // Handle font-family khusus
                if (property === "font-family") {
                  cleanValue = cleanValue.replace(/^["']|["']$/g, "");
                  if (
                    cleanValue.includes(" ") &&
                    !cleanValue.match(/^["'].*["']$/)
                  ) {
                    cleanValue = `"${cleanValue}"`;
                  }
                }

                styles[property] = cleanValue;
              }
            });

            console.log("📥 Imported styles from DOM:", styles);
            return { node: $createStyledSpanNode(styles) };
          },
          priority: 1,
        };
      },
    };
  }

  setStyles(styles: Record<string, string>): void {
    const writable = this.getWritable();
    writable.__styles = { ...styles };
  }

  getStyles(): Record<string, string> {
    return this.__styles;
  }
}

// Factory function untuk membuat StyledSpanNode
function $createStyledSpanNode(
  styles: Record<string, string> = {}
): StyledSpanNode {
  return new StyledSpanNode(styles);
}

function $isStyledSpanNode(
  node: LexicalNode | null | undefined
): node is StyledSpanNode {
  return node instanceof StyledSpanNode;
}

function parseStyleAttribute(styleText: string): Record<string, string> {
  const styles: Record<string, string> = {};

  if (!styleText || !styleText.trim()) {
    return styles;
  }

  // Split by semicolon, but be careful with quotes
  const declarations: string[] = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";

  for (let i = 0; i < styleText.length; i++) {
    const char = styleText[i];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = "";
      current += char;
    } else if (char === ";" && !inQuotes) {
      if (current.trim()) {
        declarations.push(current.trim());
      }
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last declaration if exists
  if (current.trim()) {
    declarations.push(current.trim());
  }

  console.log("🎨 CSS Declarations found:", declarations);

  // Parse each declaration
  declarations.forEach((declaration) => {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex === -1) return;

    const property = declaration.substring(0, colonIndex).trim();
    let value = declaration.substring(colonIndex + 1).trim();

    if (property && value) {
      // Handle font-family specifically - preserve quotes
      if (property === "font-family") {
        // Remove outer quotes if they exist and re-add them consistently
        const unquoted = value.replace(/^["'](.*)["']$/, "$1");

        // If font name contains spaces, ensure it's properly quoted
        if (unquoted.includes(" ") || unquoted.includes(",")) {
          value = `"${unquoted}"`;
        } else {
          value = unquoted;
        }

        console.log(
          `🎨 Font-family processed: original="${declaration}" -> property="${property}" -> value="${value}"`
        );
      }

      styles[property] = value;
      console.log(`✅ Added style: ${property} = ${value}`);
    }
  });

  return styles;
}

// 🔧 PERBAIKAN 2: Manual parsing untuk custom styled spans
// 🔧 ULTIMATE FIX: Completely rewritten parseHtmlWithStyles to handle font names with spaces
function parseHtmlWithStyles(htmlString: string) {
  console.log("🔧 Original HTML:", htmlString);

  // Step 1: Clean up the HTML string BEFORE parsing
  let cleanedHtml = htmlString;

  // Fix malformed font-family with spaces by finding and fixing the pattern
  // Pattern: font-family: "Font Name" becomes font-family: " font="" name";=""
  // We need to fix this BEFORE DOM parsing

  // Find all font-family declarations with quotes and fix them
  const fontFamilyRegex = /font-family:\s*&quot;([^&]+)&quot;/g;
  cleanedHtml = cleanedHtml.replace(fontFamilyRegex, (match, fontName) => {
    console.log(`🔧 Found font-family with quotes: "${fontName}"`);
    // Return properly escaped font-family
    return `font-family: "${fontName}"`;
  });

  // Also handle cases where quotes are already partially decoded
  const partiallyDecodedRegex = /font-family:\s*"([^"]+)"/g;
  cleanedHtml = cleanedHtml.replace(
    partiallyDecodedRegex,
    (match, fontName) => {
      console.log(`🔧 Found partially decoded font-family: "${fontName}"`);
      // Ensure proper escaping for HTML
      return `font-family: &quot;${fontName}&quot;`;
    }
  );

  // Standard HTML entity decoding
  const decodeHtmlEntities = (str: string): string => {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'");
  };

  const decodedHtml = decodeHtmlEntities(cleanedHtml);
  console.log("🔧 Cleaned and decoded HTML:", decodedHtml);

  const parser = new DOMParser();
  const dom = parser.parseFromString(decodedHtml, "text/html");

  console.log("🥹 Parsed DOM innerHTML:", dom.body.innerHTML);

  const nodes: LexicalNode[] = [];

  function processElement(element: Element): LexicalNode[] {
    const childNodes: LexicalNode[] = [];

    // Process all child nodes first
    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const textContent = child.textContent || "";
        if (textContent) {
          childNodes.push($createTextNode(textContent));
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        childNodes.push(...processElement(child as Element));
      }
    });

    // Handle SPAN elements with styles
    if (element.tagName === "SPAN") {
      const styles = extractStylesFromElement(element);

      if (Object.keys(styles).length > 0) {
        const styledSpan = $createStyledSpanNode(styles);
        childNodes.forEach((child) => styledSpan.append(child));
        return [styledSpan];
      }

      return childNodes;
    }
    // Handle P elements
    else if (element.tagName === "P") {
      const paragraph = $createParagraphNode();

      const className = element.getAttribute("class");
      const dir = element.getAttribute("dir");
      if (dir === "ltr" || dir === "rtl") {
        paragraph.setDirection(dir);
      }

      childNodes.forEach((child) => paragraph.append(child));
      return [paragraph];
    }

    return childNodes;
  }

  // Helper function to extract styles from element (handles malformed attributes)
  function extractStylesFromElement(element: Element): Record<string, string> {
    const styles: Record<string, string> = {};

    console.log("🎨 Processing element:", element.outerHTML);

    // Method 1: Try standard style attribute
    const styleAttr = element.getAttribute("style");
    if (styleAttr) {
      console.log("🎨 Found style attribute:", styleAttr);
      parseStyleString(styleAttr, styles);
    }

    // Method 2: Check for malformed font-family attributes (caused by spaces)
    // Look for attributes like geist="", mono";="", etc.
    const attributes = element.attributes;
    const suspiciousFontParts: string[] = [];

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const name = attr.name;
      const value = attr.value;

      // Detect patterns that suggest broken font-family
      if (name !== "style" && name !== "class" && name !== "dir") {
        // This might be a broken font name part
        console.log(`🔍 Suspicious attribute: ${name}="${value}"`);

        if (value === "" || value.endsWith(";")) {
          suspiciousFontParts.push(name);
        }
      }
    }

    // If we found suspicious attributes, try to reconstruct font-family
    if (suspiciousFontParts.length > 0) {
      const reconstructedFont = suspiciousFontParts.join(" ");
      console.log(
        `🔧 Reconstructed font from attributes: "${reconstructedFont}"`
      );

      // Capitalize each word properly
      const properFont = reconstructedFont.replace(
        /\b\w+/g,
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );

      styles["font-family"] = `"${properFont}"`;
      console.log(`✅ Added reconstructed font-family: "${properFont}"`);
    }

    console.log("🎨 Final extracted styles:", styles);
    return styles;
  }

  // Helper function to parse style string
  function parseStyleString(
    styleString: string,
    styles: Record<string, string>
  ): void {
    const declarations = styleString.split(";").filter((decl) => decl.trim());

    declarations.forEach((declaration) => {
      const colonIndex = declaration.indexOf(":");
      if (colonIndex === -1) return;

      const property = declaration.substring(0, colonIndex).trim();
      let value = declaration.substring(colonIndex + 1).trim();

      if (property && value) {
        if (property === "font-family") {
          // Clean up font-family value
          value = value.replace(/^["'](.*)["']$/, "$1"); // Remove outer quotes

          // Capitalize properly
          value = value.replace(
            /\b\w+/g,
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          );

          // Re-add quotes if needed
          if (value.includes(" ")) {
            value = `"${value}"`;
          }

          console.log(`🎨 Processed font-family: "${value}"`);
        }

        styles[property] = value;
        console.log(`✅ Added style: ${property} = ${value}`);
      }
    });
  }

  // Process body children
  Array.from(dom.body.children).forEach((child) => {
    nodes.push(...processElement(child));
  });

  console.log("🏗️ Generated nodes:", nodes);
  return nodes;
}

// 🔧 ALSO UPDATE: Enhanced StyledSpanNode methods
class EnhancedStyledSpanNode extends ElementNode {
  __styles: Record<string, string>;

  static getType(): string {
    return "styled-span";
  }

  static clone(node: EnhancedStyledSpanNode): EnhancedStyledSpanNode {
    return new EnhancedStyledSpanNode(node.__styles, node.__key);
  }

  constructor(styles: Record<string, string> = {}, key?: string) {
    super(key);
    this.__styles = styles;
  }

  isInline(): boolean {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  canBeEmpty(): boolean {
    return false;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    this.applyStylesToElement(span);
    console.log("🏗️ Created DOM with styles:", this.__styles);
    console.log("🏗️ Applied to element:", span.outerHTML);
    return span;
  }

  updateDOM(prevNode: EnhancedStyledSpanNode, dom: HTMLElement): boolean {
    this.applyStylesToElement(dom);
    console.log("🔄 Updated DOM with styles:", this.__styles);
    return false;
  }

  private applyStylesToElement(element: HTMLElement): void {
    // Clear existing styles
    element.removeAttribute("style");

    Object.entries(this.__styles).forEach(([property, value]) => {
      if (property === "font-family") {
        console.log(`🎯 Applying font-family: "${value}"`);

        // Multiple strategies to ensure font is applied
        try {
          // Strategy 1: CSS setProperty with important
          element.style.setProperty("font-family", value, "important");

          // Strategy 2: Direct property assignment
          (element.style as any).fontFamily = value;

          // Verify it worked
          const computed = element.style.fontFamily;
          console.log(`🔍 Font-family applied: "${computed}"`);

          // If still not working, try without quotes
          if (!computed && value.includes('"')) {
            const withoutQuotes = value.replace(/"/g, "");
            element.style.setProperty(
              "font-family",
              withoutQuotes,
              "important"
            );
            console.log(`🔧 Tried without quotes: "${withoutQuotes}"`);
          }
        } catch (error) {
          console.error(`❌ Error applying font-family:`, error);
        }
      } else {
        element.style.setProperty(property, value);
        console.log(`🎯 Applied ${property}: ${value}`);
      }
    });

    console.log(`🔍 Final element: ${element.outerHTML}`);
  }

  exportDOM(): { element: HTMLElement } {
    const element = document.createElement("span");
    this.applyStylesToElement(element);
    return { element };
  }

  exportJSON(): any {
    return {
      ...super.exportJSON(),
      styles: this.__styles,
      type: "styled-span",
      version: 1,
    };
  }

  static importJSON(serializedNode: any): EnhancedStyledSpanNode {
    const { styles } = serializedNode;
    return new EnhancedStyledSpanNode(styles || {});
  }

  static importDOM(): Record<string, any> | null {
    return {
      span: (domNode: HTMLElement) => {
        const style = domNode.getAttribute("style");
        if (!style) return null;

        return {
          conversion: (element: HTMLElement) => {
            const styles: Record<string, string> = {};
            // Use the same parsing logic
            parseStyleString(element.getAttribute("style") || "", styles);
            return { node: $createEnhancedStyledSpanNode(styles) };
          },
          priority: 1,
        };
      },
    };
  }

  setStyles(styles: Record<string, string>): void {
    const writable = this.getWritable();
    writable.__styles = { ...styles };
  }

  getStyles(): Record<string, string> {
    return this.__styles;
  }
}

// Factory functions
function $createEnhancedStyledSpanNode(
  styles: Record<string, string> = {}
): EnhancedStyledSpanNode {
  return new EnhancedStyledSpanNode(styles);
}

function $isEnhancedStyledSpanNode(
  node: LexicalNode | null | undefined
): node is EnhancedStyledSpanNode {
  return node instanceof EnhancedStyledSpanNode;
}

export {
  StyledSpanNode,
  $createStyledSpanNode,
  $isStyledSpanNode,
  parseHtmlWithStyles,
};
