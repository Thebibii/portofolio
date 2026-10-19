import { z } from "zod";
import { ProjectStatus } from "@/types/projects";

export const projectBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).default([]),
  technologies: z
    .array(z.string())
    .min(1, "At least one technology is required"),
  demoUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  featured: z.boolean().default(false),
});

export const projectServerSchema = projectBaseSchema.extend({
  startDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
  endDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
});

export const projectFormSchema = projectBaseSchema.extend({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
