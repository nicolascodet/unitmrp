const API_URL = 'http://localhost:8000'

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5000 // 5 seconds

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cacheKey = `${endpoint}-${options?.method || 'GET'}`
  const now = Date.now()

  // Check cache for GET requests
  if (!options?.method || options.method === 'GET') {
    const cached = cache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data as T
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(errorData.detail || `API Error: ${response.statusText}`)
    }

    const data = await response.json()

    // Cache successful GET requests
    if (!options?.method || options.method === 'GET') {
      cache.set(cacheKey, { data, timestamp: now })
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
    }
    throw error
  }
} 