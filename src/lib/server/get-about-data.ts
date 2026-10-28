import "server-only";
import prisma from "@/lib/prisma";
import { cache } from "react";

export type AboutProfileData = {
  name: string;
  nickname: string;
  role: string | null;
  location: string | null;
  paragraphs: string[];
  stackLine: string;
  photoUrl: string | null;
  techStack: string[];
};

export type AboutData = {
  success: true;
  data: {
    experiences: Array<{
      position: string;
      company: string;
      location: string | null;
      startDate: string;
      endDate: string | null;
      duration: string | null;
      description: string | null;
    }>;
    currentActivity: Array<{
      title: string;
      content: string;
      createdAt: string;
    }>;
    profile: AboutProfileData | null;
  };
};

/**
 * Profil saja, tanpa experience/currentActivity — dipakai halaman yang cuma
 * butuh identitas (mis. hero beranda). Dibungkus try/catch supaya halaman tetap
 * tampil kalau tabel about_profiles belum ada di environment tersebut.
 */
export const getAboutProfile = cache(
  async (): Promise<AboutProfileData | null> => {
    try {
      const row = await prisma.aboutProfile.findUnique({
        where: { id: "main" },
      });
      if (!row) return null;

      return {
        name: row.name,
        nickname: row.nickname,
        role: row.role,
        location: row.location,
        paragraphs: row.paragraphs,
        stackLine: row.stackLine,
        photoUrl: row.photoUrl,
        techStack: row.techStack,
      };
    } catch {
      return null;
    }
  }
);

/**
 * Data awal halaman /about untuk SSR (SEO): profil hero + pengalaman +
 * aktivitas.
 */
export const getAboutData = cache(async (): Promise<AboutData> => {
  const [experiences, currentActivities, profile] = await Promise.all([
    prisma.experience.findMany({ orderBy: { startDate: "desc" } }),
    prisma.currentActivity.findMany({ orderBy: { createdAt: "desc" } }),
    getAboutProfile(),
  ]);

  return {
    success: true,
    data: {
      experiences: experiences.map((experience) => ({
        position: experience.position,
        company: experience.company,
        location: experience.location,
        startDate: experience.startDate.toISOString(),
        endDate: experience.endDate ? experience.endDate.toISOString() : null,
        duration: experience.duration,
        description: experience.description,
      })),
      currentActivity: currentActivities.map((activity) => ({
        title: activity.title,
        content: activity.content,
        createdAt: activity.createdAt.toISOString(),
      })),
      profile,
    },
  };
});
