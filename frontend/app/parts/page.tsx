'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS, fetchApi } from '@/lib/api';

interface BOMStep {
  id: number;
  description: string;
  time_minutes: number | null;
  cost_per_hour: number | null;
  notes?: string;
}

interface BOMItem {
  id: number;
  material_id: number;
  material_name: string;
  quantity: number | null;
  unit: string;
}

interface BOMAssembly {
  id: number;
  steps: BOMStep[];
  materials: BOMItem[];
  cycle_time_seconds: number | null;  // For injection molding
  cavities: number | null;           // For injection molding
  scrap_rate: number | null;        // Percentage
  notes?: string;
}

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

interface Part {
  id: number;
  part_number: string;
  description: string;
  customer: string;
  material: string;
  cycle_time: number;
  price: number;
  compatible_machines: string[];
  setup_time: number;
  bom?: BOMAssembly;
}

interface NewPart {
  part_number: string;
  description: string;
  customer: string;
  material: string;
  cycle_time: number;
  price: number;
  compatible_machines: string[];
  setup_time: number;
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [newPart, setNewPart] = useState<NewPart>({ 
    part_number: '', 
    description: '',
    customer: '',
    material: '',
    cycle_time: 0,
    price: 0,
    compatible_machines: ['Machine 1'],
    setup_time: 0
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [showBOMForm, setShowBOMForm] = useState(false);
  const [newBOM, setNewBOM] = useState<Omit<BOMAssembly, 'id'>>({
    steps: [],
    materials: [],
    cycle_time_seconds: 0,
    cavities: 0,
    scrap_rate: 0,
    notes: ''
  });

  // Fetch parts
  const fetchParts = async () => {
    try {
      const data = await fetchApi<Part[]>(API_ENDPOINTS.PARTS);
      setParts(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // Search customers
  const searchCustomers = async (search: string) => {
    if (!search.trim()) {
      setCustomers([]);
      return;
    }
    
    try {
      const data = await fetchApi<Customer[]>(`${API_ENDPOINTS.CUSTOMERS_SEARCH}?query=${encodeURIComponent(search)}`);
      setCustomers(data);
    } catch (err) {
      console.error('Search error:', err);
      setCustomers([]); // Reset customers on error instead of showing error message
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerSearch) {
        searchCustomers(customerSearch);
      } else {
        setCustomers([]);
      }
    }, 300); // Wait 300ms after last keystroke before searching

    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Search materials
  const searchMaterials = async (search: string) => {
    if (!search.trim()) {
      setMaterials([]);
      return;
    }
    
    // Get unique materials from existing parts
    const uniqueMaterials = Array.from(new Set(
      parts.map(part => part.material).filter(material => 
        material.toLowerCase().includes(search.toLowerCase())
      )
    ));
    setMaterials(uniqueMaterials);
  };

  // Debounce material search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (materialSearch) {
        searchMaterials(materialSearch);
      } else {
        setMaterials([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [materialSearch, parts]);

  // Create new customer
  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const customer = await fetchApi<Customer>(API_ENDPOINTS.CUSTOMERS, {
        method: 'POST',
        body: JSON.stringify(newCustomer),
      });
      
      setNewPart({
        ...newPart,
        customer: customer.name
      });
      setShowCustomerForm(false);
      setCustomerSearch(customer.name);
    } catch (err) {
      console.error('Create customer error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create customer. Please try again.');
    }
  };

  // Save BOM
  const handleSaveBOM = async () => {
    try {
      // Clean up materials (remove any with empty names)
      const validMaterials = newBOM.materials.filter(material => material.material_name.trim() !== '');
      
      // Clean up steps (remove any with empty description)
      const validSteps = newBOM.steps.filter(step => step.description.trim() !== '');

      const bomToSave = {
        ...newBOM,
        materials: validMaterials,
        steps: validSteps
      };

      // Store the BOM data to be saved after part creation
      setNewBOM(bomToSave);
      setShowBOMForm(false);
      setError(null);
    } catch (err) {
      console.error('Create BOM error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create BOM. Please try again.');
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  // Add new part
  const handleAddPart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const createdPart = await fetchApi<Part>(API_ENDPOINTS.PARTS, {
        method: 'POST',
        body: JSON.stringify(newPart),
      });

      // If we have a BOM to save, create it now
      if (newBOM.materials.length > 0 || newBOM.steps.length > 0) {
        // Clean up materials and steps
        const validMaterials = newBOM.materials.filter(material => material.material_name.trim() !== '');
        const validSteps = newBOM.steps.filter(step => step.description.trim() !== '');

        const bomToSave = {
          ...newBOM,
          materials: validMaterials.map(material => ({
            ...material,
            quantity: material.quantity || 0
          })),
          steps: validSteps.map(step => ({
            ...step,
            time_minutes: step.time_minutes || 0,
            cost_per_hour: step.cost_per_hour || 0
          }))
        };

        await fetchApi(`${API_ENDPOINTS.BOM}?part_id=${createdPart.id}`, {
          method: 'POST',
          body: JSON.stringify(bomToSave),
        });
      }

      await fetchParts();
      setShowAddForm(false);
      setNewPart({
        part_number: '',
        description: '',
        customer: '',
        material: '',
        cycle_time: 0,
        price: 0,
        compatible_machines: ['Machine 1'],
        setup_time: 0
      });
      setCustomerSearch('');
      setNewBOM({
        steps: [],
        materials: [],
        cycle_time_seconds: 0,
        cavities: 0,
        scrap_rate: 0,
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Delete part
  const handleDeletePart = async (partId: number) => {
    try {
      await fetchApi(`${API_ENDPOINTS.PARTS}/${partId}`, {
        method: 'DELETE',
      });
      await fetchParts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parts Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Part
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white p-8 rounded-lg w-full max-w-2xl m-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Part</h2>
            <form onSubmit={handleAddPart} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Part Number:</label>
                  <input
                    type="text"
                  value={newPart.part_number}
                  onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                        </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description:</label>
                <textarea
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Customer:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setNewPart({ ...newPart, customer: e.target.value });
                    }}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                    placeholder="Search customers..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {customers.length > 0 && (
                  <div className="relative mt-1">
                    <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg">
                      {customers.map((customer) => (
                        <div
                          key={customer.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setNewPart(prev => ({ ...prev, customer: customer.name }));
                            setCustomerSearch(customer.name);
                            setCustomers([]);
                          }}
                        >
                          {customer.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Material:</label>
                <input
                  type="text"
                  value={newPart.material}
                  onChange={(e) => setNewPart({ ...newPart, material: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cycle Time (seconds):</label>
                <input
                  type="number"
                  value={newPart.cycle_time}
                  onChange={(e) => setNewPart({ ...newPart, cycle_time: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price:</label>
                <input
                  type="number"
                  value={newPart.price}
                  onChange={(e) => setNewPart({ ...newPart, price: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Setup Time (minutes):</label>
                <input
                  type="number"
                  value={newPart.setup_time}
                  onChange={(e) => setNewPart({ ...newPart, setup_time: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Compatible Machines:</label>
                <input
                  type="text"
                  value={newPart.compatible_machines.join(', ')}
                  onChange={(e) => setNewPart({ ...newPart, compatible_machines: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Enter machine names separated by commas"
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowBOMForm(true)}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Create BOM
                </button>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setCustomerSearch('');
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save Part
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts List */}
      <div className="grid gap-4">
        {parts.map((part) => (
          <div key={part.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg mb-2">{part.part_number}</h3>
                <p className="text-gray-600 mb-1">{part.description}</p>
                <p className="text-sm">Customer: {part.customer}</p>
                <p className="text-sm">Material: {part.material}</p>
                <p className="text-sm">Cycle Time: {part.cycle_time}s</p>
                <p className="text-sm">Setup Time: {part.setup_time}min</p>
                <p className="text-sm">Price: ${part.price}</p>
                <p className="text-sm">Compatible Machines: {part.compatible_machines.join(', ')}</p>
              </div>
              <button
                onClick={() => handleDeletePart(part.id)}
                className="text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
            {part.bom && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Bill of Materials</h4>
                {part.bom.materials.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-1">Materials:</h5>
                    <ul className="list-disc list-inside">
                      {part.bom.materials.map((material, idx) => (
                        <li key={idx} className="text-sm">
                          {material.material_name} - {material.quantity} {material.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {part.bom.steps.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Assembly Steps:</h5>
                    <ol className="list-decimal list-inside">
                      {part.bom.steps.map((step, idx) => (
                        <li key={idx} className="text-sm">
                          {step.description} ({step.time_minutes} min @ ${step.cost_per_hour}/hr)
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {parts.length === 0 && (
          <p className="text-gray-500 text-center">No parts available</p>
        )}
      </div>

      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Customer</h2>
            <form onSubmit={handleCreateCustomer} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Customer Name:</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email:</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone:</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address:</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes:</label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBOMForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Bill of Materials</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">Materials:</label>
                  <button
                    type="button"
                    onClick={() => setNewBOM({
                      ...newBOM,
                      materials: [...newBOM.materials, { 
                        id: Date.now(), 
                        material_id: 0,
                        material_name: '',
                        quantity: null, 
                        unit: 'pcs' 
                      }]
                    })}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    + Add Material
                  </button>
                </div>
                {newBOM.materials.map((material, index) => (
                  <div key={material.id} className="grid grid-cols-12 gap-4 items-start border p-4 rounded-lg">
                    <div className="col-span-5 relative">
                      <label className="block text-xs text-gray-500 mb-1">Material Name:</label>
                      <input
                        type="text"
                        value={material.material_name}
                        onChange={(e) => {
                          const updatedMaterials = [...newBOM.materials];
                          updatedMaterials[index] = { ...material, material_name: e.target.value };
                          setNewBOM({ ...newBOM, materials: updatedMaterials });
                          setMaterialSearch(e.target.value);
                        }}
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Enter material name"
                      />
                      {materials.length > 0 && materialSearch && (
                        <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
                          {materials.map((mat, i) => (
                            <div
                              key={i}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                const updatedMaterials = [...newBOM.materials];
                                updatedMaterials[index] = { ...material, material_name: mat };
                                setNewBOM({ ...newBOM, materials: updatedMaterials });
                                setMaterialSearch('');
                                setMaterials([]);
                              }}
                            >
                              {mat}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Quantity:</label>
                      <input
                        type="number"
                        value={material.quantity || ''}
                        onChange={(e) => {
                          const updatedMaterials = [...newBOM.materials];
                          updatedMaterials[index] = { ...material, quantity: e.target.value === '' ? null : parseFloat(e.target.value) };
                          setNewBOM({ ...newBOM, materials: updatedMaterials });
                        }}
                        className="w-full border rounded-lg px-4 py-2"
                        min="0"
                        step="0.01"
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Unit:</label>
                      <select
                        value={material.unit}
                        onChange={(e) => {
                          const updatedMaterials = [...newBOM.materials];
                          updatedMaterials[index] = { ...material, unit: e.target.value };
                          setNewBOM({ ...newBOM, materials: updatedMaterials });
                        }}
                      className="w-full border rounded-lg px-4 py-2"
                      >
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="lb">Pounds</option>
                        <option value="m">Meters</option>
                        <option value="cm">Centimeters</option>
                        <option value="mm">Millimeters</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedMaterials = newBOM.materials.filter((_, i) => i !== index);
                          setNewBOM({ ...newBOM, materials: updatedMaterials });
                        }}
                        className="mt-6 text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">Assembly Steps:</label>
                  <button
                    type="button"
                    onClick={() => setNewBOM({
                      ...newBOM,
                      steps: [...newBOM.steps, { 
                        id: Date.now(), 
                        description: '', 
                        time_minutes: null, 
                        cost_per_hour: null 
                      }]
                    })}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    + Add Step
                  </button>
                </div>
                {newBOM.steps.map((step, index) => (
                  <div key={step.id} className="grid grid-cols-12 gap-4 items-start border p-4 rounded-lg">
                    <div className="col-span-6">
                      <label className="block text-xs text-gray-500 mb-1">Description:</label>
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => {
                          const updatedSteps = [...newBOM.steps];
                          updatedSteps[index] = { ...step, description: e.target.value };
                          setNewBOM({ ...newBOM, steps: updatedSteps });
                        }}
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Enter step description"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Time (min):</label>
                      <input
                        type="number"
                        value={step.time_minutes || ''}
                        onChange={(e) => {
                          const updatedSteps = [...newBOM.steps];
                          updatedSteps[index] = { ...step, time_minutes: e.target.value === '' ? null : parseFloat(e.target.value) };
                          setNewBOM({ ...newBOM, steps: updatedSteps });
                        }}
                        className="w-full border rounded-lg px-4 py-2"
                        min="0"
                        step="0.1"
                        placeholder="Enter time"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Cost per Hour:</label>
                      <input
                        type="number"
                        value={step.cost_per_hour || ''}
                        onChange={(e) => {
                          const updatedSteps = [...newBOM.steps];
                          updatedSteps[index] = { ...step, cost_per_hour: e.target.value === '' ? null : parseFloat(e.target.value) };
                          setNewBOM({ ...newBOM, steps: updatedSteps });
                        }}
                        className="w-full border rounded-lg px-4 py-2"
                        min="0"
                        step="0.01"
                        placeholder="Enter cost per hour"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSteps = newBOM.steps.filter((_, i) => i !== index);
                          setNewBOM({ ...newBOM, steps: updatedSteps });
                        }}
                        className="mt-6 text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes:</label>
                <textarea
                  value={newBOM.notes}
                  onChange={(e) => setNewBOM({ ...newBOM, notes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Any additional notes about the assembly process..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBOMForm(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBOM}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save BOM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 