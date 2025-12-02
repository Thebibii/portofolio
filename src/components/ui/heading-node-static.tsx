import * as React from "react";

import type { SlateElementProps } from "platejs/static";

import { type VariantProps, cva } from "class-variance-authority";

const headingVariants = cva("relative mb-1", {
  variants: {
    variant: {
      h1: "pt-[1.6em] pb-1 font-bold font-heading text-4xl",
      h2: "pt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight",
      h3: "pt-[1em] pb-px font-heading font-semibold text-xl tracking-tight",
      h4: "pt-[0.75em] font-heading font-semibold text-lg tracking-tight",
      h5: "pt-[0.75em] font-semibold text-lg tracking-tight",
      h6: "pt-[0.75em] font-semibold text-base tracking-tight",
    },
  },
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function HeadingElementStatic({
  variant = "h1",
  ...props
}: SlateElementProps & VariantProps<typeof headingVariants>) {
  // Ambil plain text dari children
  const text =
    props.element?.children?.map?.((c: any) => c.text).join(" ") ?? "";
  const id = slugify(text);

  // Render langsung elemen HTML heading
  const Tag = variant as React.ElementType;
  return (
    <Tag {...props.attributes} id={id} className={headingVariants({ variant })}>
      {props.children}
    </Tag>
  );
}

export function H1ElementStatic(props: SlateElementProps) {
  return <HeadingElementStatic variant="h1" {...props} />;
}

export function H2ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h2" {...props} />;
}

export function H3ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h3" {...props} />;
}

export function H4ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h4" {...props} />;
}

export function H5ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h5" {...props} />;
}

export function H6ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h6" {...props} />;
}
