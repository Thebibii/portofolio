import { Icons } from "@/components/icons";

export const NavList = [
  {
    name: "projek",
    href: "/projects",
  },
  {
    name: "tulisan",
    href: "/writings",
  },
  {
    name: "blog",
    href: "/blogs",
  },
  {
    name: "tentang",
    href: "/about",
  },
];

/**
 * URL CV untuk link "Resume (CV)" di hero beranda.
 * Mengarah ke PDF di Google Drive (akses publik, link view). Kalau string ini
 * dikosongkan lagi, item-nya balik jadi teks nonaktif, bukan link rusak.
 */
export const RESUME_URL =
  "https://drive.google.com/file/d/1kaqxdSkRxnJS0IqfmibwmX2dJWxYgOjg/view";

export const SocialMediaList = [
  {
    name: "Email",
    link: "#",
    icon: <Icons.Mail />,
  },
  {
    name: "Github",
    link: "https://github.com/Thebibii",
    icon: <Icons.Github />,
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/the_bibiee",
    icon: <Icons.Instagram />,
  },
];
