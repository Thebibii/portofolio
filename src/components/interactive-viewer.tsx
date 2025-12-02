"use client";

import { PlateView, usePlateViewEditor } from "platejs/react";
import { BaseEditorKit } from "./editor-base-kit";
import { getHeadingList, headingItemVariants } from "./ui/toc-node-static";
import { Button } from "./ui/button";
import Link from "next/link";

export function InteractiveViewer({ value }: any) {
  const editor = usePlateViewEditor({
    plugins: BaseEditorKit,
    value,
  });
  const headingList = getHeadingList(editor);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  return (
    <section className="lg:grid lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-10">
      <PlateView editor={editor} />
      <aside>
        <div className="sticky top-36">
          <div className="max-h-[calc(100vh-9rem-113px)] overflow-auto border mt-4 border-muted-foreground px-6 rounded-xl py-5 hidden lg:block">
            <div className="flex flex-col space-y-2 text-sm">
              <div className="flex flex-col space-y-2 text-sm">
                {headingList.length > 0 ? (
                  headingList.map((item) => (
                    <Button
                      key={item.title}
                      variant="ghost"
                      className={headingItemVariants({
                        depth: item.depth as 1 | 2 | 3,
                        style: "clean",
                        className:
                          "hover:bg-transparent no-underline hover:underline text-muted-foreground py-0",
                      })}
                      asChild
                    >
                      <Link href={`#${slugify(item.title)}`}>{item.title}</Link>
                    </Button>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">
                    Create a heading to display the table of contents.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
