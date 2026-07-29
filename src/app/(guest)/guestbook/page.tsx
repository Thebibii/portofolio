"use client";
import GiscusComments from "@/components/reusable/giscus-comments";

export default function GuestbookPage() {
  return (
    <div className="space-y-12 font-mono pt-9 pb-12 lg:pt-24 mx-auto w-full max-w-6xl px-6 lg:px-8 xl:px-0">
      <div className="flex flex-col space-y-8 items-center mx-auto w-full justify-center">
        <header className="space-y-4 items-center justify-center flex flex-col">
          <h1 className="text-5xl h1">Buku Tamu</h1>
          <p className="transition-colors bg-gradient-to-r from-gray-500/80 via-black to-gray-500/80 bg-clip-text text-transparent">
            Tinggalkan pesan atau sapa
          </p>
        </header>
        <div className="w-full mt-16">
          <GiscusComments />
        </div>
      </div>
    </div>
  );
}
