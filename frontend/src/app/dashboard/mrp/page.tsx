"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Material {
  id: number;
  name: string;
  type: "raw" | "finished" | "component";
  supplier: {
    id: number;
    name: string;
    lead_time_days: number;
  };
  price: number;
  moq: number;
  lead_time_days: number;
  reorder_point: number;
}

interface MaterialRequirement {
  material_id: number;
  current_inventory: number;
  reorder_point: number;
  moq: number;
  lead_time_days: number;
  days_until_reorder: number;
}

export default function MRPPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [requirements, setRequirements] = useState<Map<number, MaterialRequirement>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [planningDays, setPlanningDays] = useState("30");

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      fetchRequirements();
    }
  }, [materials, planningDays]);

  const fetchMaterials = async () => {
    try {
      const response = await fetch("http://localhost:8000/materials/");
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchRequirements = async () => {
    try {
      const requirementsMap = new Map<number, MaterialRequirement>();
      
      await Promise.all(
        materials.map(async (material) => {
          const response = await fetch(
            `http://localhost:8000/materials/${material.id}/requirements?days=${planningDays}`
          );
          const data = await response.json();
          requirementsMap.set(material.id, data);
        })
      );
      
      setRequirements(requirementsMap);
    } catch (error) {
      console.error("Error fetching requirements:", error);
    }
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedType || material.type === selectedType)
  );

  const getRequirementStatus = (requirement: MaterialRequirement) => {
    if (requirement.current_inventory <= requirement.reorder_point) {
      return "urgent";
    }
    if (requirement.days_until_reorder <= requirement.lead_time_days) {
      return "warning";
    }
    return "ok";
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Material Requirements Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="raw">Raw Materials</SelectItem>
                  <SelectItem value="component">Components</SelectItem>
                  <SelectItem value="finished">Finished Goods</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={planningDays}
                onValueChange={setPlanningDays}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Planning horizon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchRequirements}>Refresh</Button>
            </div>

            {requirements.size > 0 && (
              <div className="space-y-4">
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Urgent Reorder Required</AlertTitle>
                  <AlertDescription>
                    {Array.from(requirements.values()).filter(
                      (req) => getRequirementStatus(req) === "urgent"
                    ).length}{" "}
                    materials are below reorder point
                  </AlertDescription>
                </Alert>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead>MOQ</TableHead>
                      <TableHead>Lead Time (Days)</TableHead>
                      <TableHead>Days Until Reorder</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => {
                      const requirement = requirements.get(material.id);
                      if (!requirement) return null;

                      const status = getRequirementStatus(requirement);
                      
                      return (
                        <TableRow key={material.id}>
                          <TableCell>{material.name}</TableCell>
                          <TableCell>{material.type}</TableCell>
                          <TableCell>{requirement.current_inventory}</TableCell>
                          <TableCell>{requirement.reorder_point}</TableCell>
                          <TableCell>{requirement.moq}</TableCell>
                          <TableCell>{requirement.lead_time_days}</TableCell>
                          <TableCell>
                            {Math.round(requirement.days_until_reorder)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                status === "urgent"
                                  ? "bg-red-100 text-red-800"
                                  : status === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {status === "urgent"
                                ? "Reorder Now"
                                : status === "warning"
                                ? "Plan Reorder"
                                : "OK"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 