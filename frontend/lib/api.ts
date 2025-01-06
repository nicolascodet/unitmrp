const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/orders`,
  PARTS: `${API_BASE_URL}/parts`,
  PARTS_SEARCH: `${API_BASE_URL}/parts/search`,
  INVENTORY: `${API_BASE_URL}/inventory`,
  PURCHASE_ORDERS: `${API_BASE_URL}/purchase-orders`,
  MATERIALS: `${API_BASE_URL}/materials`,
  QUALITY_CHECKS: `${API_BASE_URL}/quality-checks`,
  PRODUCTION_RUNS: `${API_BASE_URL}/production-runs`,
  SUPPLIERS: `${API_BASE_URL}/suppliers`,
  CUSTOMERS: `${API_BASE_URL}/customers`,
  CUSTOMERS_SEARCH: `${API_BASE_URL}/customers/search`,
  BOM: `${API_BASE_URL}/bom`,
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getParts() {
  return fetchApi(API_ENDPOINTS.PARTS);
}

export interface Part {
  id: number;
  part_number: string;
  description: string;
}

export async function searchParts(query: string): Promise<Part[]> {
  return fetchApi<Part[]>(`${API_ENDPOINTS.PARTS_SEARCH}?query=${encodeURIComponent(query)}`);
}

export async function getProductionRuns() {
  return fetchApi(API_ENDPOINTS.PRODUCTION_RUNS);
}

export async function getQualityChecks() {
  return fetchApi(API_ENDPOINTS.QUALITY_CHECKS);
}

export async function getSuppliers() {
  return fetchApi(API_ENDPOINTS.SUPPLIERS);
} 