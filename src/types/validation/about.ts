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
