/** Item bucket list dalam bentuk yang aman dikirim ke client (tanggal = ISO string). */
export type BucketItemData = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  images: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
};

/** Payload form admin untuk create/update item. */
export type BucketItemFormData = {
  title: string;
  description?: string | null;
  completed: boolean;
  completedAt?: string | null;
  images: string[];
};
