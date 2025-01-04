'use client';

import { useState, useEffect } from 'react';
import { getParts, createPart, updatePart, deletePart } from '@/lib/api';

export default function PartsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load parts on mount
  useEffect(() => {
    loadParts();
  }, []);

  async function loadParts() {
    try {
      setLoading(true);
      setError('');
      const data = await getParts();
      console.log('Loaded parts:', data);
      setParts(data);
    } catch (err) {
      console.error('Error loading parts:', err);
      setError('Failed to load parts: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      setError('');
      const partData = {
        name: formData.get('name') as string,
        quantity: parseInt(formData.get('quantity') as string),
        description: formData.get('description') as string,
      };

      await createPart(partData);
      setIsAddModalOpen(false);
      loadParts(); // Reload parts list
      form.reset();
    } catch (err) {
      console.error('Error adding part:', err);
      setError('Failed to add part: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleUpdateQuantity(partId: number, newQuantity: number) {
    try {
      setError('');
      await updatePart(partId, { quantity: newQuantity });
      loadParts(); // Reload parts list
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleDeletePart(partId: number) {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      setError('');
      await deletePart(partId);
      loadParts(); // Reload parts list
    } catch (err) {
      console.error('Error deleting part:', err);
      setError('Failed to delete part: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <div className="text-center">Loading parts...</div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parts</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Part
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.length > 0 ? (
              parts.map((part: any) => (
                <tr key={part.id} className="border-b">
                  <td className="px-6 py-4 whitespace-nowrap">{part.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={part.quantity}
                      onChange={(e) => handleUpdateQuantity(part.id, parseInt(e.target.value))}
                      min="0"
                      className="w-20 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-6 py-4">{part.description || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeletePart(part.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No parts available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Part</h2>
            <form onSubmit={handleAddPart}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="0"
                  defaultValue="0"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
} 