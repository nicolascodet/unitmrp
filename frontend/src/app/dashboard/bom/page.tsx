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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Part {
  id: number;
  part_number: string;
  description: string;
  customer: string;
  material: string;
  cycle_time: number;
  price: number;
  setup_time: number;
  compatible_machines: string[];
}

interface BOMItem {
  id: number;
  parent_part_id: number;
  child_part_id: number;
  quantity: number;
  process_step: string;
  setup_time: number;
  cycle_time: number;
  notes?: string;
  child_part?: Part;
}

export default function BOMPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [newComponent, setNewComponent] = useState({
    child_part_id: "",
    quantity: "0",
    process_step: "",
    setup_time: "0",
    cycle_time: "0",
    notes: "",
  });

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    if (selectedPart) {
      fetchBOM(selectedPart.id);
    }
  }, [selectedPart]);

  const fetchParts = async () => {
    try {
      const response = await fetch("http://localhost:8000/parts");
      const data = await response.json();
      setParts(data);
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  const fetchBOM = async (partId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/parts/${partId}/bom`);
      const data = await response.json();
      
      // Fetch child part details for each BOM item
      const bomWithDetails = await Promise.all(
        data.map(async (item: BOMItem) => {
          const childPartResponse = await fetch(`http://localhost:8000/parts/${item.child_part_id}`);
          const childPart = await childPartResponse.json();
          return { ...item, child_part: childPart };
        })
      );
      
      setBomItems(bomWithDetails);
    } catch (error) {
      console.error("Error fetching BOM:", error);
    }
  };

  const addComponent = async () => {
    if (!selectedPart || !newComponent.child_part_id || !newComponent.quantity) {
      console.error("Missing required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/bom-items/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_part_id: selectedPart.id,
          child_part_id: parseInt(newComponent.child_part_id),
          quantity: parseFloat(newComponent.quantity),
          process_step: newComponent.process_step,
          setup_time: parseFloat(newComponent.setup_time),
          cycle_time: parseFloat(newComponent.cycle_time),
          notes: newComponent.notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to add component");
      }

      const result = await response.json();
      setIsAddingComponent(false);
      await fetchBOM(selectedPart.id);
      setNewComponent({
        child_part_id: "",
        quantity: "0",
        process_step: "",
        setup_time: "0",
        cycle_time: "0",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding component:", error);
      // You might want to show an error message to the user here
    }
  };

  const filteredParts = parts.filter((part) =>
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill of Materials Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parts List</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell>{part.part_number}</TableCell>
                          <TableCell>{part.description}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedPart(part)}
                            >
                              View BOM
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {selectedPart && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      BOM for {selectedPart.part_number}
                      <Button
                        className="ml-4"
                        onClick={() => setIsAddingComponent(true)}
                      >
                        Add Component
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Process</TableHead>
                          <TableHead>Setup Time</TableHead>
                          <TableHead>Cycle Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bomItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.child_part?.part_number}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.process_step}</TableCell>
                            <TableCell>{item.setup_time}</TableCell>
                            <TableCell>{item.cycle_time}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingComponent} onOpenChange={setIsAddingComponent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Component</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Component</Label>
              <Select
                value={newComponent.child_part_id}
                onValueChange={(value) =>
                  setNewComponent({ ...newComponent, child_part_id: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a component" />
                </SelectTrigger>
                <SelectContent>
                  {parts
                    .filter((part) => part.id !== selectedPart?.id)
                    .map((part) => (
                      <SelectItem key={part.id} value={part.id.toString()}>
                        {part.part_number} - {part.description}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newComponent.quantity}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, quantity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Process Step</Label>
              <Input
                type="text"
                value={newComponent.process_step}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, process_step: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Setup Time (minutes)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={newComponent.setup_time}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, setup_time: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Cycle Time (minutes)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={newComponent.cycle_time}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, cycle_time: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                type="text"
                value={newComponent.notes}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, notes: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={addComponent}
              disabled={!newComponent.child_part_id || !newComponent.quantity}
            >
              Add Component
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 