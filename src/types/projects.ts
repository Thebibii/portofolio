import type { ProjectFormValues } from "@/types/validation/project";

export type ProjectFormData = ProjectFormValues;

export enum ProjectStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
  ARCHIVED = "ARCHIVED",
}
