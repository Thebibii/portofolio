import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guestbook",
};

export default function GuestbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
