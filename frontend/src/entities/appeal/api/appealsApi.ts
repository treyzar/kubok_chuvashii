import { apiClient } from '@/shared/api';
import type {
  Appeal,
  AppealDetailsResponse,
  AppealComment,
  AppealHistoryEvent,
  AppealPayload,
  UpdateAppealPayload,
  FetchAppealsParams,
  HeatmapPoint,
  HeatmapStats,
  HeatmapParams,
} from '../model/types';

export const fetchAppeals = async (
  params?: FetchAppealsParams
): Promise<{ tickets: Appeal[]; total: number }> => {
  const response = await apiClient.get('/tickets', { params });
  return response.data;
};

export const fetchAppealById = async (id: string): Promise<AppealDetailsResponse> => {
  const response = await apiClient.get(`/tickets/${id}`);
  return response.data;
};

export const createAppeal = async (payload: AppealPayload) => {
  const response = await apiClient.post('/public/tickets', payload);
  return response.data;
};

export const updateAppeal = async (id: string, payload: UpdateAppealPayload) => {
  const response = await apiClient.patch(`/tickets/${id}`, payload);
  return response.data;
};

export const hideAppeal = async (id: string) => {
  const response = await apiClient.post(`/tickets/${id}/hide`);
  return response.data;
};

export const deleteAppeal = async (id: string) => {
  const response = await apiClient.delete(`/tickets/${id}`);
  return response.data;
};

export const fetchAppealComments = async (
  id: string
): Promise<{ comments: AppealComment[] }> => {
  const response = await apiClient.get(`/tickets/${id}/comments`);
  return response.data;
};

export const postAppealComment = async (id: string, payload: { message: string }) => {
  const response = await apiClient.post(`/tickets/${id}/comments`, payload);
  return response.data;
};

export const fetchAppealHistory = async (id: string): Promise<AppealHistoryEvent[]> => {
  const response = await apiClient.get(`/tickets/${id}/history`);
  return response.data.history || [];
};

export const fetchHeatmapPoints = async (
  params?: HeatmapParams
): Promise<{ points: HeatmapPoint[] }> => {
  const response = await apiClient.get('/heatmap/points', { params });
  return response.data;
};

export const fetchHeatmapStats = async (): Promise<HeatmapStats> => {
  const response = await apiClient.get('/heatmap/stats');
  return response.data;
};

export const fetchSimilarAppeals = async (id: string): Promise<{ similar: SimilarAppeal[] }> => {
  const response = await apiClient.get(`/tickets/${id}/similar`);
  return response.data;
};

export const mergeAppeals = async (originalId: string, duplicates: string[]) => {
  const response = await apiClient.post('/tickets/merge', {
    original: originalId,
    duplicates: duplicates,
  });
  return response.data;
};
