import { create } from 'zustand';
import { getParts, getCustomers, getInventory, getMaterials, createInventoryItem, createMaterial } from './api';
import type { Part, Customer, Material, InventoryItem } from '../types';

interface AppState {
  parts: Part[];
  customers: Customer[];
  inventory: InventoryItem[];
  materials: Material[];
  bomItems: Record<number, any[]>;
  loading: boolean;
  error: string | null;

  fetchAllData: () => Promise<void>;
  fetchBOMItems: (partId: number) => Promise<void>;
  addPart: (part: Part) => void;
  addCustomer: (customer: Customer) => void;
  addBOMItem: (parentId: number, item: any) => void;
  deletePart: (id: number) => void;
  addInventoryItem: (data: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  addMaterial: (data: Omit<Material, 'id'>) => Promise<Material>;
}

export const useStore = create<AppState>((set, get) => ({
  parts: [],
  customers: [],
  inventory: [],
  materials: [],
  bomItems: {},
  loading: true,
  error: null,

  fetchAllData: async () => {
    try {
      const [partsData, customersData, inventoryData, materialsData] = await Promise.all([
        getParts(),
        getCustomers(),
        getInventory(),
        getMaterials()
      ]);

      set({
        parts: partsData,
        customers: customersData,
        inventory: inventoryData,
        materials: materialsData,
        loading: false,
        error: null
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addInventoryItem: async (data: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem = await createInventoryItem(data);
      set(state => ({
        inventory: [...state.inventory, newItem],
        error: null
      }));
      return newItem;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addMaterial: async (data: Omit<Material, 'id'>) => {
    try {
      const newMaterial = await createMaterial(data);
      set(state => ({
        materials: [...state.materials, newMaterial],
        error: null
      }));
      return newMaterial;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
})); 