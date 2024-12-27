'use client'

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
import { Textarea } from "@/components/ui/textarea";

interface Part {
  id: number;
  part_number: string;
  description: string;
}

interface QualityCheck {
  id: number;
  part_id: number;
  part: Part;
  check_date: string;
  quantity_checked: number;
  quantity_rejected: number;
  notes: string;
  status: "passed" | "failed" | "pending";
  inventory_item_id?: number;
}

interface InventoryItem {
  id: number;
  material: {
    name: string;
  };
  batch_number: string;
  quantity: number;
}

export default function QualityPage() {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isAddingCheck, setIsAddingCheck] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [newCheck, setNewCheck] = useState({
    part_id: "",
    quantity_checked: "",
    quantity_rejected: "",
    notes: "",
    status: "pending",
    inventory_item_id: "",
  });

  useEffect(() => {
    fetchQualityChecks();
    fetchParts();
    fetchInventory();
  }, []);

  const fetchQualityChecks = async () => {
    try {
      const response = await fetch("http://localhost:8000/quality-checks");
      const data = await response.json();
      setQualityChecks(data);
    } catch (error) {
      console.error("Error fetching quality checks:", error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await fetch("http://localhost:8000/parts");
      const data = await response.json();
      setParts(data);
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:8000/inventory");
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addQualityCheck = async () => {
    try {
      const response = await fetch("http://localhost:8000/quality-checks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          part_id: parseInt(newCheck.part_id),
          quantity_checked: parseInt(newCheck.quantity_checked),
          quantity_rejected: parseInt(newCheck.quantity_rejected),
          notes: newCheck.notes,
          status: newCheck.status,
          inventory_item_id: newCheck.inventory_item_id
            ? parseInt(newCheck.inventory_item_id)
            : null,
        }),
      });

      if (response.ok) {
        setIsAddingCheck(false);
        fetchQualityChecks();
        setNewCheck({
          part_id: "",
          quantity_checked: "",
          quantity_rejected: "",
          notes: "",
          status: "pending",
          inventory_item_id: "",
        });
      }
    } catch (error) {
      console.error("Error adding quality check:", error);
    }
  };

  const calculateDefectRate = (check: QualityCheck) => {
    return ((check.quantity_rejected / check.quantity_checked) * 100).toFixed(2);
  };

  const filteredChecks = qualityChecks.filter(
    (check) =>
      (check.part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        check.notes.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedStatus || check.status === selectedStatus)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Quality Control Checks
              <Button onClick={() => setIsAddingCheck(true)}>Add Quality Check</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search checks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={selectedStatus}
                  onValueChange={(value: string) => setSelectedStatus(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity Checked</TableHead>
                    <TableHead>Defect Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>{check.part.part_number}</TableCell>
                      <TableCell>
                        {new Date(check.check_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{check.quantity_checked}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            parseFloat(calculateDefectRate(check)) > 5
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {calculateDefectRate(check)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            check.status === "passed"
                              ? "bg-green-100 text-green-800"
                              : check.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {check.status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {check.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {parts.map((part) => {
                const partChecks = qualityChecks.filter(
                  (check) => check.part_id === part.id
                );
                if (partChecks.length === 0) return null;

                const totalChecked = partChecks.reduce(
                  (sum, check) => sum + check.quantity_checked,
                  0
                );
                const totalRejected = partChecks.reduce(
                  (sum, check) => sum + check.quantity_rejected,
                  0
                );
                const defectRate = ((totalRejected / totalChecked) * 100).toFixed(2);

                return (
                  <div key={part.id} className="space-y-2">
                    <h3 className="font-medium">{part.part_number}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Total Checked</div>
                        <div className="text-2xl font-semibold">{totalChecked}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Total Rejected</div>
                        <div className="text-2xl font-semibold">{totalRejected}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Defect Rate</div>
                        <div className="text-2xl font-semibold">{defectRate}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddingCheck} onOpenChange={setIsAddingCheck}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Quality Check</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Part</Label>
              <Select
                value={newCheck.part_id}
                onValueChange={(value: string) =>
                  setNewCheck({ ...newCheck, part_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part..." />
                </SelectTrigger>
                <SelectContent>
                  {parts.map((part) => (
                    <SelectItem key={part.id} value={part.id.toString()}>
                      {part.part_number} - {part.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Inventory Batch (Optional)</Label>
              <Select
                value={newCheck.inventory_item_id}
                onValueChange={(value: string) =>
                  setNewCheck({ ...newCheck, inventory_item_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {inventory.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.material.name} - Batch {item.batch_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity Checked</Label>
              <Input
                type="number"
                value={newCheck.quantity_checked}
                onChange={(e) =>
                  setNewCheck({ ...newCheck, quantity_checked: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity Rejected</Label>
              <Input
                type="number"
                value={newCheck.quantity_rejected}
                onChange={(e) =>
                  setNewCheck({ ...newCheck, quantity_rejected: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={newCheck.status}
                onValueChange={(value: "passed" | "failed" | "pending") =>
                  setNewCheck({ ...newCheck, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newCheck.notes}
                onChange={(e) =>
                  setNewCheck({ ...newCheck, notes: e.target.value })
                }
                placeholder="Enter quality check notes, observations, and process documentation..."
              />
            </div>
            <Button onClick={addQualityCheck}>Add Check</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 