import { apiClient } from '@/shared/api';
import type { Category, CategoryStatistics, Subcategory } from '../model/types';

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/public/categories');
  return response.data.categories;
};

export const fetchCategoryStatistics = async (): Promise<CategoryStatistics[]> => {
  const response = await apiClient.get('/statistics/categories');
  return response.data;
};

export const createCategory = async (name: string): Promise<{ id: number; name: string }> => {
  const response = await apiClient.post('/admin/categories', { name });
  return response.data;
};

export const createSubcategory = async (categoryId: number, name: string): Promise<Subcategory> => {
  const response = await apiClient.post(`/admin/categories/${categoryId}/subcategories`, { name });
  return response.data;
};
