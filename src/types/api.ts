export type ApiSuccess<T> = {
  success?: boolean;
  data: T;
  message?: string;
};

export type ApiError = {
  error: string | string[];
  message?: string;
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type Paginated<T> = ApiSuccess<T[]> & { meta: PaginationMeta };
