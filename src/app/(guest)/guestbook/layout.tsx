import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guestbook",
  description:
    "Leave a message — guestbook for visitors to share thoughts, feedback, or just say hello.",
  openGraph: {
    title: "Guestbook | The Bibi",
    description:
      "Leave a message — guestbook for visitors to share thoughts, feedback, or just say hello.",
  },
  alternates: {
    canonical: "https://thebibie.vercel.app/guestbook",
  },
};

export default function GuestbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
