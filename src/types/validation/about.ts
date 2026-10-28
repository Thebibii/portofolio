import { z } from "zod";

export const experienceSchema = z.object({
  id: z
    .union([z.string(), z.number()])
    .transform((val) => val?.toString())
    .optional(),
  dbId: z.union([z.string(), z.number()]).optional(),
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().nullable().optional(),
  startDate: z.coerce.date(), // bisa parse dari string
  endDate: z.coerce.date().nullable().optional(),
  duration: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});
export const experiencesSchema = z.array(experienceSchema);

export const currentActivitySchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  dbId: z.union([z.string(), z.number()]).optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const currentActivitiesSchema = z.array(currentActivitySchema);

export const aboutSchema = z.object({
  experiences: z.array(experienceSchema).default([]),
  currentActivities: z.array(currentActivitySchema).default([]),
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type Experiences = z.infer<typeof experiencesSchema>;

export type CurrentActivityFormData = z.infer<typeof currentActivitySchema>;
export type CurrentActivities = z.infer<typeof currentActivitiesSchema>;
export type AboutFormData = z.infer<typeof aboutSchema>;

export const ABOUT_TECH_STACK_KEYS = [
  "nextjs",
  "nodejs",
  "typescript",
  "tailwind",
  "react",
  "vercel",
] as const;

export const aboutProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
  nickname: z.string().trim().min(1, "Panggilan wajib diisi").max(60),
  role: z.string().trim().max(120).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  paragraphs: z
    .array(
      z.string().trim().min(1, "Paragraf tidak boleh kosong").max(1200)
    )
    .max(10)
    .default([]),
  stackLine: z.string().trim().min(1, "Kalimat tech stack wajib diisi").max(300),
  photoUrl: z
    .union([z.string().url("URL foto tidak valid"), z.literal("")])
    .optional()
    .nullable(),
  techStack: z.array(z.enum(ABOUT_TECH_STACK_KEYS)).default([]),
});

export type AboutProfileInput = z.infer<typeof aboutProfileSchema>;

