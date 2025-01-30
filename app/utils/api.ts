import type { Part, Customer, BOMItem, Material, InventoryItem } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Parts
export async function getParts(): Promise<Part[]> {
  return fetchApi<Part[]>('/parts');
}

export async function createPart(data: Omit<Part, 'id'>): Promise<Part> {
  return fetchApi<Part>('/parts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePart(id: number): Promise<void> {
  await fetchApi(`/parts/${id}`, { method: 'DELETE' });
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  return fetchApi<Customer[]>('/customers');
}

export async function createCustomer(data: Omit<Customer, 'id'>): Promise<Customer> {
  return fetchApi<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// BOM Items
export async function getBOMItems(partId: number): Promise<BOMItem[]> {
  return fetchApi<BOMItem[]>(`/parts/${partId}/bom`);
}

export async function createBOMItem(data: Omit<BOMItem, 'id'>): Promise<BOMItem> {
  return fetchApi<BOMItem>('/bom', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Materials
export async function getMaterials(): Promise<Material[]> {
  return fetchApi<Material[]>('/materials');
}

export async function createMaterial(data: Omit<Material, 'id'>): Promise<Material> {
  return fetchApi<Material>('/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Inventory
export async function getInventory(): Promise<InventoryItem[]> {
  return fetchApi<InventoryItem[]>('/inventory');
}

export async function createInventoryItem(data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  return fetchApi<InventoryItem>('/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  });
} 