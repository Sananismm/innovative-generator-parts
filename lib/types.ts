export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type Role = "ADMIN" | "EDITOR" | "CUSTOMER";

export type CatalogueProduct = {
  id: string;
  name: string;
  slug: string;
  category: { name: string; slug: string };
  shortDescription: string | null;
  description: string | null;
  workingPrinciple: string;
  dailyUse: string;
  manufacturer: string | null;
  partNumber: string | null;
  oemReference: string | null;
  compatibleBrands: string[];
  compatibleModels: string[];
  engineFamily: string | null;
  attributes: Record<string, string> | null;
  image: string | null;
  imageAlt: string | null;
  featured: boolean;
  popular: boolean;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CatalogueCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  imageAlt: string | null;
  sortOrder: number;
  productCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CatalogueFilters = {
  query?: string;
  category?: string;
  manufacturer?: string;
  tag?: string;
  sort?: "featured" | "name" | "latest";
  page?: number;
  pageSize?: number;
};
