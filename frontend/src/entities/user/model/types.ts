export interface User {
  id: string;
  email: string;
  role: 'admin' | 'org' | 'executor';
  status: 'active' | 'blocked';
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  department_id?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'org' | 'executor';
  status: 'active' | 'blocked';
  department_id: number | null;
  department_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  created_at: string;
}

export interface CreateUserPayload {
  email: string;
  role: 'admin' | 'org' | 'executor';
  password?: string;
  department_id?: number;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
}
