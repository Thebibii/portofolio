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
 * Sengaja dikosongkan sementara — selama string ini kosong, item-nya dirender
 * sebagai teks nonaktif (bukan link rusak). Isi dengan URL CV asli kalau sudah siap.
 */
export const RESUME_URL = "";

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
