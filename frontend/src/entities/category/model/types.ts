export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}

export interface Category {
  category_info: {
    id: number;
    name: string;
  };
  subcategories: Subcategory[];
}

export interface CategoryStatistics {
  id: number;
  name: string;
  ticket_count: number;
}
