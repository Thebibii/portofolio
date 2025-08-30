export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    posts: number;
  };
}
