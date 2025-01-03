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
import { Textarea } from "@/components/ui/textarea";

interface Machine {
  id: number;
  name: string;
  status: boolean;
  current_shifts: number;
  hours_per_shift: number;
  last_updated: string;
}

interface MaintenanceRecord {
  id: number;
  machine_id: number;
  machine: Machine;
  type: "scheduled" | "unscheduled" | "breakdown";
  description: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  status: "planned" | "in_progress" | "completed";
  technician: string;
  parts_used: string;
  cost: number;
}

export default function MaintenancePage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [newRecord, setNewRecord] = useState({
    machine_id: "",
    type: "scheduled",
    description: "",
    start_time: "",
    end_time: "",
    technician: "",
    parts_used: "",
    cost: "",
    status: "planned",
  });

  useEffect(() => {
    fetchMachines();
    fetchMaintenanceRecords();
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

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/maintenance-records");
      const data = await response.json();
      setMaintenanceRecords(data);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
    }
  };

  const addMaintenanceRecord = async () => {
    try {
      const response = await fetch("http://localhost:8000/maintenance-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machine_id: parseInt(newRecord.machine_id),
          type: newRecord.type,
          description: newRecord.description,
          start_time: newRecord.start_time,
          end_time: newRecord.end_time || null,
          technician: newRecord.technician,
          parts_used: newRecord.parts_used,
          cost: parseFloat(newRecord.cost),
          status: newRecord.status,
        }),
      });

      if (response.ok) {
        setIsAddingRecord(false);
        fetchMaintenanceRecords();
        setNewRecord({
          machine_id: "",
          type: "scheduled",
          description: "",
          start_time: "",
          end_time: "",
          technician: "",
          parts_used: "",
          cost: "",
          status: "planned",
        });
      }
    } catch (error) {
      console.error("Error adding maintenance record:", error);
    }
  };

  const calculateDowntime = (record: MaintenanceRecord) => {
    if (!record.end_time) return null;
    const start = new Date(record.start_time);
    const end = new Date(record.end_time);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.round(diffMinutes);
  };

  const calculateMTBF = (machineId: number) => {
    const machineRecords = maintenanceRecords.filter(
      (record) => record.machine_id === machineId && record.type === "breakdown"
    );
    if (machineRecords.length < 2) return null;

    const totalOperatingHours = machineRecords.reduce((acc, curr, index) => {
      if (index === 0) return 0;
      const prevFailure = new Date(machineRecords[index - 1].end_time!);
      const currentFailure = new Date(curr.start_time);
      return acc + (currentFailure.getTime() - prevFailure.getTime()) / (1000 * 60 * 60);
    }, 0);

    return Math.round(totalOperatingHours / (machineRecords.length - 1));
  };

  const filteredRecords = maintenanceRecords.filter(
    (record) =>
      record.machine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedType === "all" || !selectedType || record.type === selectedType) &&
      (selectedStatus === "all" || !selectedStatus || record.status === selectedStatus)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Maintenance Records
              <Button onClick={() => setIsAddingRecord(true)}>Add Record</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={selectedType || undefined}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="unscheduled">Unscheduled</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus || undefined}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration (min)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.machine.name}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            record.type === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : record.type === "unscheduled"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(record.start_time).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {calculateDowntime(record) || "In Progress"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            record.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : record.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell>${record.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Machine Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {machines.map((machine) => {
                const machineRecords = maintenanceRecords.filter(
                  (record) => record.machine_id === machine.id
                );
                if (machineRecords.length === 0) return null;

                const totalDowntime = machineRecords.reduce((acc, record) => {
                  const downtime = calculateDowntime(record);
                  return acc + (downtime || 0);
                }, 0);

                const mtbf = calculateMTBF(machine.id);

                return (
                  <div key={machine.id} className="space-y-2">
                    <h3 className="font-medium">{machine.name}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Total Downtime</div>
                        <div className="text-2xl font-semibold">
                          {Math.round(totalDowntime / 60)}h
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">MTBF</div>
                        <div className="text-2xl font-semibold">
                          {mtbf ? `${mtbf}h` : "N/A"}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Total Cost</div>
                        <div className="text-2xl font-semibold">
                          $
                          {machineRecords
                            .reduce((acc, record) => acc + record.cost, 0)
                            .toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Machine</Label>
              <Select
                value={newRecord.machine_id || undefined}
                onValueChange={(value) =>
                  setNewRecord({ ...newRecord, machine_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id.toString()}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newRecord.type}
                onValueChange={(value: "scheduled" | "unscheduled" | "breakdown") =>
                  setNewRecord({ ...newRecord, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="unscheduled">Unscheduled</SelectItem>
                  <SelectItem value="breakdown">Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newRecord.description}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={newRecord.start_time}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, start_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={newRecord.end_time}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={newRecord.status}
                onValueChange={(value: "planned" | "in_progress" | "completed") =>
                  setNewRecord({ ...newRecord, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Technician</Label>
              <Input
                value={newRecord.technician}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, technician: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Parts Used</Label>
              <Input
                value={newRecord.parts_used}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, parts_used: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Cost</Label>
              <Input
                type="number"
                value={newRecord.cost}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, cost: e.target.value })
                }
              />
            </div>
            <Button onClick={addMaintenanceRecord} className="w-full">
              Add Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 