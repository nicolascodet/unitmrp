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

interface Part {
  id: number;
  part_number: string;
  description: string;
  compatible_machines: string[];
  setup_time: number;
  cycle_time: number;
}

interface Machine {
  id: number;
  name: string;
  status: boolean;
  current_shifts: number;
  hours_per_shift: number;
  current_job: string | null;
}

interface ProductionRun {
  id: number;
  part_id: number;
  quantity: number;
  start_time: string;
  end_time: string | null;
  status: string;
}

interface EnrichedProductionRun extends ProductionRun {
  part?: Part;
}

export default function ProductionPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [productionRuns, setProductionRuns] = useState<EnrichedProductionRun[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [isAddingRun, setIsAddingRun] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRun, setNewRun] = useState({
    part_id: "",
    quantity: "",
    start_time: "",
    machine_id: "",
  });

  useEffect(() => {
    fetchMachines();
    fetchParts();
    fetchProductionRuns();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await fetch("http://localhost:8000/machines");
      const data = await response.json();
      setMachines(data);
    } catch (error) {
      console.error("Error fetching machines:", error);
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

  const fetchProductionRuns = async () => {
    try {
      const response = await fetch("http://localhost:8000/production-runs");
      const runs = await response.json();
      
      // Fetch part details for each run
      const enrichedRuns = await Promise.all(
        runs.map(async (run: ProductionRun) => {
          const partResponse = await fetch(`http://localhost:8000/parts/${run.part_id}`);
          const part = await partResponse.json();
          return { ...run, part };
        })
      );
      
      setProductionRuns(enrichedRuns);
    } catch (error) {
      console.error("Error fetching production runs:", error);
    }
  };

  const getCompatibleMachines = (partId: string) => {
    const part = parts.find(p => p.id.toString() === partId);
    if (!part) return machines;
    return machines.filter(m => part.compatible_machines.includes(m.name));
  };

  const addProductionRun = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!newRun.part_id || !newRun.quantity || !newRun.start_time) {
        throw new Error('All fields are required');
      }

      const response = await fetch("http://localhost:8000/production-runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          part_id: parseInt(newRun.part_id),
          quantity: parseInt(newRun.quantity),
          start_time: new Date(newRun.start_time).toISOString(),
          status: "pending"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create production run');
      }

      await fetchProductionRuns();
      setIsAddingRun(false);
      setNewRun({
        part_id: "",
        quantity: "",
        start_time: "",
        machine_id: "",
      });
    } catch (error) {
      console.error("Error adding production run:", error);
      setError(error instanceof Error ? error.message : 'Failed to create production run');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Production Planning</h2>
        <Button onClick={() => setIsAddingRun(true)}>Schedule Production Run</Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Production Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>{run.part?.part_number || 'Loading...'}</TableCell>
                      <TableCell>{run.quantity}</TableCell>
                      <TableCell>
                        {new Date(run.start_time).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {run.end_time
                          ? new Date(run.end_time).toLocaleString()
                          : "Not Completed"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            run.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : run.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {run.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddingRun} onOpenChange={setIsAddingRun}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Production Run</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Part</Label>
              <Select
                value={newRun.part_id}
                onValueChange={(value) =>
                  setNewRun({ ...newRun, part_id: value })
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
              <Label>Machine</Label>
              <Select
                value={newRun.machine_id}
                onValueChange={(value) =>
                  setNewRun({ ...newRun, machine_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select machine..." />
                </SelectTrigger>
                <SelectContent>
                  {getCompatibleMachines(newRun.part_id).map((machine) => (
                    <SelectItem key={machine.id} value={machine.id.toString()}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={newRun.quantity}
                onChange={(e) =>
                  setNewRun({ ...newRun, quantity: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={newRun.start_time}
                onChange={(e) =>
                  setNewRun({ ...newRun, start_time: e.target.value })
                }
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button 
              onClick={addProductionRun}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Scheduling...' : 'Schedule Run'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 