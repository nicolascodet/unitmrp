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

interface Machine {
  id: number;
  name: string;
  status: boolean;
  current_shifts: number;
  hours_per_shift: number;
  current_job: string | null;
  last_updated: string;
}

interface Part {
  id: number;
  part_number: string;
  description: string;
  compatible_machines: string[];
  setup_time: number;
  cycle_time: number;
}

interface ProductionRun {
  id: number;
  part_id: number;
  part: Part;
  quantity: number;
  start_time: string;
  end_time: string | null;
  status: string;
}

export default function ProductionPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [productionRuns, setProductionRuns] = useState<ProductionRun[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [isAddingRun, setIsAddingRun] = useState(false);
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
      const data = await response.json();
      setProductionRuns(data);
    } catch (error) {
      console.error("Error fetching production runs:", error);
    }
  };

  const addProductionRun = async () => {
    try {
      const response = await fetch("http://localhost:8000/production-runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          part_id: parseInt(newRun.part_id),
          quantity: parseInt(newRun.quantity),
          start_time: newRun.start_time,
          machine_id: parseInt(newRun.machine_id),
          status: "pending",
        }),
      });

      if (response.ok) {
        setIsAddingRun(false);
        fetchProductionRuns();
        setNewRun({
          part_id: "",
          quantity: "",
          start_time: "",
          machine_id: "",
        });
      }
    } catch (error) {
      console.error("Error adding production run:", error);
    }
  };

  const calculateMachineUtilization = (machine: Machine) => {
    const totalMinutesPerDay = machine.current_shifts * machine.hours_per_shift * 60;
    const runningJobs = productionRuns.filter(
      (run) => run.status === "in_progress" && run.part.compatible_machines.includes(machine.name)
    );
    
    const totalJobMinutes = runningJobs.reduce((acc, run) => {
      return acc + (run.part.setup_time + run.part.cycle_time * run.quantity);
    }, 0);

    return Math.min((totalJobMinutes / totalMinutesPerDay) * 100, 100);
  };

  const getCompatibleMachines = (partId: string) => {
    const part = parts.find((p) => p.id === parseInt(partId));
    if (!part) return [];
    return machines.filter((machine) => part.compatible_machines.includes(machine.name));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Machine Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shifts</TableHead>
                  <TableHead>Hours/Shift</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Current Job</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((machine) => {
                  const utilization = calculateMachineUtilization(machine);
                  return (
                    <TableRow key={machine.id}>
                      <TableCell>{machine.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            machine.status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {machine.status ? "Running" : "Idle"}
                        </span>
                      </TableCell>
                      <TableCell>{machine.current_shifts}</TableCell>
                      <TableCell>{machine.hours_per_shift}</TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{Math.round(utilization)}%</span>
                      </TableCell>
                      <TableCell>{machine.current_job || "None"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Production Schedule
              <Button onClick={() => setIsAddingRun(true)}>Add Production Run</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>{run.part.part_number}</TableCell>
                    <TableCell>{run.quantity}</TableCell>
                    <TableCell>
                      {new Date(run.start_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
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
            <Button onClick={addProductionRun}>Schedule Run</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 