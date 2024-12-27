"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Material {
  id: number;
  name: string;
  type: "raw" | "finished" | "component";
  supplier: {
    id: number;
    name: string;
  };
  price: number;
  moq: number;
  lead_time_days: number;
  reorder_point: number;
  specifications: Record<string, any>;
}

interface InventoryItem {
  id: number;
  material: Material;
  batch_number: string;
  quantity: number;
  location: string;
  status: string;
  expiry_date: string | null;
  received_date: string;
  last_updated: string;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [newItem, setNewItem] = useState({
    material_id: "",
    batch_number: "",
    quantity: "",
    location: "",
    status: "available",
    expiry_date: "",
  });

  useEffect(() => {
    fetchMaterials();
    fetchInventory();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch("http://localhost:8000/materials/");
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchInventory = async () => {
    try {
      let url = "http://localhost:8000/inventory/";
      const params = new URLSearchParams();
      
      if (selectedLocation) params.append("location", selectedLocation);
      if (selectedStatus) params.append("status", selectedStatus);
      
      if (params.toString()) {
        url += "?" + params.toString();
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addInventoryItem = async () => {
    try {
      const response = await fetch("http://localhost:8000/inventory/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material_id: parseInt(newItem.material_id),
          batch_number: newItem.batch_number,
          quantity: parseFloat(newItem.quantity),
          location: newItem.location,
          status: newItem.status,
          expiry_date: newItem.expiry_date || null,
        }),
      });

      if (response.ok) {
        setIsAddingItem(false);
        fetchInventory();
        setNewItem({
          material_id: "",
          batch_number: "",
          quantity: "",
          location: "",
          status: "available",
          expiry_date: "",
        });
      }
    } catch (error) {
      console.error("Error adding inventory item:", error);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const locations = Array.from(new Set(inventory.map((item) => item.location)));
  const statuses = ["available", "reserved", "quarantine"];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Inventory Management
            <Button onClick={() => setIsAddingItem(true)}>Add Inventory Item</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={selectedLocation}
                onValueChange={(value) => {
                  setSelectedLocation(value);
                  fetchInventory();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  fetchInventory();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.material.name}</TableCell>
                    <TableCell>{item.batch_number}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      {new Date(item.last_updated).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Material</Label>
              <select
                className="w-full p-2 border rounded"
                value={newItem.material_id}
                onChange={(e) =>
                  setNewItem({ ...newItem, material_id: e.target.value })
                }
              >
                <option value="">Select material...</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input
                value={newItem.batch_number}
                onChange={(e) =>
                  setNewItem({ ...newItem, batch_number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={newItem.location}
                onChange={(e) =>
                  setNewItem({ ...newItem, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={newItem.status}
                onChange={(e) =>
                  setNewItem({ ...newItem, status: e.target.value })
                }
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="quarantine">Quarantine</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={newItem.expiry_date}
                onChange={(e) =>
                  setNewItem({ ...newItem, expiry_date: e.target.value })
                }
              />
            </div>
            <Button onClick={addInventoryItem}>Add Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 