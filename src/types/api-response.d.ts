export declare interface ApiResponse<T = object> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

export declare interface IMeta {
  next_page_url: string | null;
  prev_page_url: string | null;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export declare interface PaginationResponse<T> extends Omit<ApiResponse, "data"> {
  data: T[];
  meta: IMeta;
}

export declare interface IUser {
  id: number;
  username: string;
  is_changed: 0 | 1;
  is_staff: 0 | 1;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

export declare interface ITokenUser extends Omit<ApiResponse, "data"> {
  data: {
    token: string;
    user: IUser;
  }
}

export declare interface ApiCatchError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    }
  }
}