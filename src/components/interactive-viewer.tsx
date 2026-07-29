"use client";

import { List } from "lucide-react";
import Link from "next/link";
import { PlateView, usePlateViewEditor } from "platejs/react";
import { BaseEditorKit } from "./editor-base-kit";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { getHeadingList, headingItemVariants } from "./ui/toc-node-static";

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
    <>
      <section className="lg:grid lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-10">
        <PlateView editor={editor} />
        <aside>
          <div className="sticky top-36">
            <div className="max-h-[calc(100vh-9rem-113px)] overflow-auto border mt-4 border-muted-foreground px-6 rounded-xl py-5 hidden lg:block">
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
                    Buat judul bagian untuk menampilkan daftar isi.
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </section>

      {headingList.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 z-40 gap-2 rounded-md bg-background/50 border border-muted-foreground/50 text-foreground shadow-lg backdrop-blur-sm lg:hidden"
              aria-label="Buka daftar isi"
            >
              <List className="size-3" />
              <span className="text-xs font-medium">Daftar Isi</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="px-6 py-4 pb-8 outline-none">
            <SheetTitle className="px-1 pt-2">Daftar Isi</SheetTitle>
            <SheetDescription className="sr-only">
              Navigasi ke bagian berbeda dari halaman ini
            </SheetDescription>
            <div className="flex flex-col">
              {headingList.map((item) => (
                <SheetClose key={item.title} asChild>
                  <Button
                    variant="ghost"
                    className={headingItemVariants({
                      depth: item.depth as 1 | 2 | 3,
                      style: "clean",
                      className:
                        "hover:bg-transparent no-underline hover:underline text-muted-foreground justify-start py-1.5 text-sm",
                    })}
                    asChild
                  >
                    <Link href={`#${slugify(item.title)}`}>{item.title}</Link>
                  </Button>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
