export interface Part {
  id: number;
  part_number: string;
  description: string;
  customer_id: number;
  customer?: Customer;
  material: string;
  price: number;
  cycle_time: number;
  setup_time: number;
  compatible_machines: string[];
}

export interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  contact_person: string;
  email: string;
}

export interface BOMItem {
  id: number;
  parent_part_id: number;
  child_part_id: number;
  quantity: number;
  process_step: string;
  setup_time: number;
  cycle_time: number;
  notes?: string;
}

export interface Material {
  id: number;
  name: string;
  type: string;
  supplier_id: number;
  price: number;
  moq: number;
  lead_time_days: number;
  reorder_point: number;
  specifications: Record<string, any>;
}

export interface InventoryItem {
  id: number;
  material_id: number;
  batch_number: string;
  quantity: number;
  location: string;
  expiry_date?: string;
  status: string;
}

export interface ProductionRun {
  id: number;
  part_id: number;
  quantity: number;
  start_date: string;
  end_date: string;
  status: string;
  priority: number;
  notes?: string;
}

export interface Machine {
  id: number;
  name: string;
  type: string;
  status: string;
  maintenance_schedule: string;
  last_maintenance: string;
  next_maintenance: string;
}

export interface MaintenanceRecord {
  id: number;
  machine_id: number;
  maintenance_type: string;
  date: string;
  technician: string;
  description: string;
  parts_used: string[];
  cost: number;
}

export interface QualityCheck {
  id: number;
  production_run_id: number;
  inspector: string;
  date: string;
  measurements: Record<string, number>;
  pass: boolean;
  notes?: string;
}

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  order_date: string;
  delivery_date: string;
  status: string;
  items: {
    material_id: number;
    quantity: number;
    unit_price: number;
  }[];
  total_amount: number;
} 