const API_URL = 'http://localhost:8000';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function getParts() {
  console.log('Fetching parts from:', `${API_URL}/parts`);
  const response = await fetch(`${API_URL}/parts`);
  return handleResponse(response);
}

export async function createPart(data: { name: string; quantity: number; description?: string }) {
  console.log('Creating part:', data);
  const response = await fetch(`${API_URL}/parts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updatePart(id: number, data: { quantity?: number; name?: string; description?: string }) {
  console.log('Updating part:', { id, data });
  const response = await fetch(`${API_URL}/parts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deletePart(id: number) {
  console.log('Deleting part:', id);
  const response = await fetch(`${API_URL}/parts/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Basic API functions for production runs
export async function getProductionRuns() {
  const res = await fetch(`${API_URL}/production-runs`);
  if (!res.ok) throw new Error('Failed to fetch production runs');
  return res.json();
}

// Basic API functions for quality checks
export async function getQualityChecks() {
  const res = await fetch(`${API_URL}/quality-checks`);
  if (!res.ok) throw new Error('Failed to fetch quality checks');
  return res.json();
} 