import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888/api/v1';


axios.interceptors.request.use((config) => {
    try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            const { state } = JSON.parse(authStorage);
            if (state?.userId) {
                config.headers['X-User-ID'] = state.userId;
                console.log('Adding X-User-ID header:', state.userId); 
            } else {
                console.log('No userId in state:', state); 
            }
        }
    } catch (error) {
        console.error('Failed to add auth header:', error);
    }
    return config;
});

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
    address?: string | null;
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

export const updateTicket = async (id: string, payload: { status?: string; department_id?: number | null; add_tags?: number[]; remove_tags?: number[] }) => {
    const response = await axios.patch(`${API_BASE_URL}/tickets/${id}`, payload);
    return response.data;
};

export const hideTicket = async (id: string) => {
    const response = await axios.post(`${API_BASE_URL}/tickets/${id}/hide`);
    return response.data;
};

export const deleteTicket = async (id: string) => {
    const response = await axios.delete(`${API_BASE_URL}/tickets/${id}`);
    return response.data;
};

export const postTicketComment = async (id: string, payload: { message: string }) => {
    const response = await axios.post(`${API_BASE_URL}/tickets/${id}/comments`, payload);
    return response.data;
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

export interface UpdateUserPayload {
    role?: 'admin' | 'org' | 'executor';
    status?: 'active' | 'blocked';
    department_id?: number;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
}

export const listAdminUsers = async (params?: {
    role?: string;
    status?: string;
    email?: string;
    limit?: number;
    offset?: number;
}): Promise<{ users: AdminUser[]; total: number }> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, { params });
    return response.data;
};

export const createAdminUser = async (payload: CreateUserPayload): Promise<AdminUser> => {
    const response = await axios.post(`${API_BASE_URL}/admin/users`, payload);
    return response.data;
};

export const updateAdminUser = async (id: string, payload: UpdateUserPayload): Promise<AdminUser> => {
    const response = await axios.patch(`${API_BASE_URL}/admin/users/${id}`, payload);
    return response.data;
};

export const deleteAdminUser = async (id: string): Promise<AdminUser> => {
    const response = await axios.delete(`${API_BASE_URL}/admin/users/${id}`);
    return response.data;
};



export interface Tag {
    id: number;
    name: string;
}

export interface Subcategory {
    id: number;
    category_id: number;
    name: string;
}

export const adminCreateCategory = async (name: string): Promise<{ id: number; name: string }> => {
    const response = await axios.post(`${API_BASE_URL}/admin/categories`, { name });
    return response.data;
};

export const adminCreateSubcategory = async (categoryId: number, name: string): Promise<Subcategory> => {
    const response = await axios.post(`${API_BASE_URL}/admin/categories/${categoryId}/subcategories`, { name });
    return response.data;
};

export const adminGetTags = async (): Promise<{ tags: Tag[] }> => {
    const response = await axios.get(`${API_BASE_URL}/admin/tags`);
    return response.data;
};

export const adminCreateTag = async (name: string): Promise<Tag> => {
    const response = await axios.post(`${API_BASE_URL}/admin/tags`, { name });
    return response.data;
};


export interface Department {
    id: number;
    name: string;
}

export const getDepartments = async (): Promise<{ departments: Department[] }> => {
    const response = await axios.get(`${API_BASE_URL}/admin/departments`);
    return response.data;
};
