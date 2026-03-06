import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888/api/v1';

export interface Category {
    category_info: {
        id: number;
        name: string;
    };
    subcategories: {
        id: number;
        category_id: number;
        name: string;
    }[];
}

export interface TicketPayload {
    description: string;
    sender_name: string;
    sender_phone?: string;
    sender_email?: string;
    longitude: number;
    latitude: number;
    subcategory_id: number;
}

export interface Ticket {
    id: string;
    status: string;
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

export interface ComplaintDetails {
    id: string;
    ticket: string;
    description: string;
    sender_name: string;
    sender_phone: string | null;
    sender_email: string | null;
    latitude: number;
    longitude: number;
}

export interface TicketDetailsResponse {
    ticket: Ticket;
    details: ComplaintDetails[];
}

export interface Comment {
    id: string;
    ticket: string;
    message: string;
    user_name?: string;
    user_email?: string;
    created_at?: string;
}

export interface HistoryEvent {
    id: string;
    ticket_id: string;
    action: string;
    old_value?: any;
    new_value?: any;
    user_name?: string;
    created_at: string;
}

export interface StatisticsSummary {
    total: number;
    resolved: number;
    in_progress: number;
    active_executors: number;
}

export interface CategoryStatistics {
    id: number;
    name: string;
    ticket_count: number;
}

export interface DynamicsDataPoint {
    date: string;
    received: number;
    resolved: number;
}

export interface DynamicsResponse {
    period: string;
    data: DynamicsDataPoint[];
}

export interface OverdueTicket {
    id: string;
    description: string;
    status: string;
    subcategory_id: number;
    department_id: number | null;
    status_start_date: string;
    lost_days: number;
}

export interface DepartmentEfficiency {
    department_name: string;
    in_progress: number;
    overdue: number;
    avg_resolution_days: number;
    trend_percent: number;
}

export interface KPIMetrics {
    avg_response_days: number;
    overdue_count: number;
    satisfaction_index: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
    const response = await axios.get(`${API_BASE_URL}/public/categories`);
    return response.data.categories;
};

export const createTicket = async (payload: TicketPayload) => {
    const response = await axios.post(`${API_BASE_URL}/public/tickets`, payload);
    return response.data;
};

export const fetchTickets = async (params?: any): Promise<{ tickets: Ticket[], total: number }> => {
    const response = await axios.get(`${API_BASE_URL}/tickets`, { params });
    return response.data;
};

export const getTicket = async (id: string): Promise<TicketDetailsResponse> => {
    const response = await axios.get(`${API_BASE_URL}/tickets/${id}`);
    return response.data;
};

export const getTicketComments = async (id: string): Promise<{ comments: Comment[] }> => {
    const response = await axios.get(`${API_BASE_URL}/tickets/${id}/comments`);
    return response.data;
};

export const getTicketHistory = async (id: string): Promise<HistoryEvent[]> => {
    const response = await axios.get(`${API_BASE_URL}/tickets/${id}/history`);
    return response.data.history || [];
};

export const getStatisticsSummary = async (): Promise<StatisticsSummary> => {
    const response = await axios.get(`${API_BASE_URL}/statistics/summary`);
    return response.data;
};

export const getCategoryStatistics = async (): Promise<CategoryStatistics[]> => {
    const response = await axios.get(`${API_BASE_URL}/statistics/categories`);
    return response.data;
};

export const getDynamics = async (params?: { period?: 'day' | 'week', start_date?: string, end_date?: string }): Promise<DynamicsResponse> => {
    const response = await axios.get(`${API_BASE_URL}/statistics/dynamics`, { params });
    return response.data;
};

export const getOverdueTickets = async (params?: { department_id?: number, min_lost_days?: number, limit?: number }): Promise<{ tickets: OverdueTicket[], total: number }> => {
    const response = await axios.get(`${API_BASE_URL}/monitoring/overdue`, { params });
    return response.data;
};

export const getDepartmentEfficiency = async (): Promise<DepartmentEfficiency[]> => {
    const response = await axios.get(`${API_BASE_URL}/monitoring/departments`);
    return response.data.departments;
};

export const getKPI = async (params?: { period?: 'week' | 'month' | 'year' }): Promise<KPIMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/monitoring/kpi`, { params });
    return response.data;
};

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

export const getHeatmapPoints = async (params?: { 
    period?: 'week' | 'month' | 'year';
    categories?: number[];
}): Promise<{ points: HeatmapPoint[] }> => {
    const response = await axios.get(`${API_BASE_URL}/heatmap/points`, { params });
    return response.data;
};

export const getHeatmapStats = async (): Promise<HeatmapStats> => {
    const response = await axios.get(`${API_BASE_URL}/heatmap/stats`);
    return response.data;
};
