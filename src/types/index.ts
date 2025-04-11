// Entity Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// API Error Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Request Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface QueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 