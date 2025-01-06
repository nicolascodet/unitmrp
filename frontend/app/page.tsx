import { API_ENDPOINTS, fetchApi } from '@/lib/api'

interface Part {
  id: number
  name: string
  quantity: number
}

interface ProductionRun {
  id: number
  part_name: string
  status: string
}

interface QualityCheck {
  id: number
  part_name: string
  result: string
}

export default async function Home() {
  try {
    // Fetch data from API
    const [parts, runs, checks] = await Promise.all([
      fetchApi<Part[]>(API_ENDPOINTS.PARTS).catch(() => []),
      fetchApi<ProductionRun[]>(API_ENDPOINTS.PRODUCTION_RUNS).catch(() => []),
      fetchApi<QualityCheck[]>(API_ENDPOINTS.QUALITY_CHECKS).catch(() => [])
    ]);

    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">MRP Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Parts Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Parts</h2>
            {parts.length > 0 ? (
              <ul className="space-y-2">
                {parts.map((part: any) => (
                  <li key={part.id} className="p-2 bg-gray-50 rounded">
                    {part.name} - Qty: {part.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No parts available</p>
            )}
          </div>

          {/* Production Runs Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Production Runs</h2>
            {runs.length > 0 ? (
              <ul className="space-y-2">
                {runs.map((run: any) => (
                  <li key={run.id} className="p-2 bg-gray-50 rounded">
                    {run.part_name} - Status: {run.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No production runs available</p>
            )}
          </div>

          {/* Quality Checks Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Quality Checks</h2>
            {checks.length > 0 ? (
              <ul className="space-y-2">
                {checks.map((check: any) => (
                  <li key={check.id} className="p-2 bg-gray-50 rounded">
                    {check.part_name} - Result: {check.result}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No quality checks available</p>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="p-8">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Backend Not Available</h1>
          <p className="text-gray-600 mb-4">
            Please make sure the backend server is running at http://localhost:8000
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              To start the backend server, run:<br />
              <code className="bg-yellow-100 px-2 py-1 rounded">python -m uvicorn main:app --reload</code><br />
              in your backend directory
            </p>
          </div>
        </div>
      </main>
    );
  }
}
