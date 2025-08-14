export interface ProjectFormData {
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  images: string[];
  technologies: string[];
  demoUrl?: string;
  sourceUrl?: string;
  status: ProjectStatus;
  featured: boolean;
  startDate?: Date;
  endDate?: Date;
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
  ARCHIVED = "ARCHIVED",
}
