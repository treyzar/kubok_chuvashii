export interface Appeal {
  id: string;
  status: 'init' | 'open' | 'closed' | 'rejected';
  description: string;
  subcategory_id: number;
  subcategory_name?: string;
  category_name?: string;
  department_id: number | null;
  department_name?: string | null;
  is_hidden: boolean;
  is_deleted: boolean;
  created_at: string;
  tags?: number[];
  tag_ids?: number[];
  tag_names?: string[];
  similarity?: number | null;
}

export interface AppealDetails {
  id: string;
  ticket: string;
  description: string;
  sender_name: string;
  sender_phone: string | null;
  sender_email: string | null;
  latitude: number;
  longitude: number;
}

export interface AppealDetailsResponse {
  ticket: Appeal;
  details: AppealDetails[];
}

export interface AppealComment {
  id: string;
  ticket: string;
  message: string;
  user_name?: string;
  user_email?: string;
  created_at?: string;
}

export interface AppealHistoryEvent {
  id: string;
  ticket_id: string;
  action: string;
  old_value?: any;
  new_value?: any;
  user_name?: string;
  created_at: string;
}

export interface AppealPayload {
  description: string;
  sender_name: string;
  sender_phone?: string;
  sender_email?: string;
  longitude: number;
  latitude: number;
  subcategory_id: number;
}

export interface UpdateAppealPayload {
  status?: string;
  department_id?: number | null;
  add_tags?: number[];
  remove_tags?: number[];
}

export interface FetchAppealsParams {
  status?: string;
  category_id?: number;
  subcategory_id?: number;
  department_id?: number;
  tags?: number[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  count: number;
}

export interface HeatmapStats {
  top_locations: Array<{
    lat: number;
    lng: number;
    ticket_count: number;
  }>;
  total_locations: number;
  avg_tickets_per_location: number;
}

export interface HeatmapParams {
  period?: 'week' | 'month' | 'year';
  categories?: number[];
}

export interface SimilarAppeal {
  id: string;
  status: 'init' | 'open' | 'closed' | 'rejected';
  description: string;
  subcategory_id: number;
  department_id: number | null;
  category_name: string | null;
  subcategory_name: string | null;
  department_name: string | null;
  similarity_score: number;
}
