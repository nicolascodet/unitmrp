'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Customer {
  id: number
  name: string
  contact: string
  email: string
  phone: string
  address: string
}

interface Material {
  id: number
  name: string
  type: string
  unit: string
  quantity: number
}

interface Part {
  id: number
  part_number: string
  description: string
  customer_id: number
  material_id: number
  setup_time: number
  cycle_time: number
  price: number
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [isAddingPart, setIsAddingPart] = useState(false)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [materialSearch, setMaterialSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  })

  const [newPart, setNewPart] = useState({
    part_number: "",
    description: "",
    customer_id: "",
    material_id: "",
    setup_time: "",
    cycle_time: "",
    price: "",
  })

  useEffect(() => {
    fetchParts()
    fetchCustomers()
    fetchMaterials()
  }, [])

  const fetchParts = async () => {
    try {
      const response = await fetch("http://localhost:8000/parts")
      const data = await response.json()
      setParts(data)
    } catch (error) {
      console.error("Error fetching parts:", error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:8000/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchMaterials = async () => {
    try {
      const response = await fetch("http://localhost:8000/materials")
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error("Error fetching materials:", error)
    }
  }

  const addPart = async () => {
    try {
      setError(null)
      setIsLoading(true)

      if (!newPart.part_number || !newPart.customer_id || !newPart.material_id) {
        throw new Error('Required fields are missing')
      }

      const response = await fetch("http://localhost:8000/parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          part_number: newPart.part_number,
          description: newPart.description,
          customer_id: parseInt(newPart.customer_id),
          material_id: parseInt(newPart.material_id),
          setup_time: parseFloat(newPart.setup_time) || 0,
          cycle_time: parseFloat(newPart.cycle_time) || 0,
          price: parseFloat(newPart.price) || 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create part')
      }

      await fetchParts()
      setIsAddingPart(false)
      setNewPart({
        part_number: "",
        description: "",
        customer_id: "",
        material_id: "",
        setup_time: "",
        cycle_time: "",
        price: "",
      })
    } catch (error) {
      console.error("Error adding part:", error)
      setError(error instanceof Error ? error.message : 'Failed to create part')
    } finally {
      setIsLoading(false)
    }
  }

  const addCustomer = async () => {
    try {
      setError(null)
      setIsLoading(true)

      if (!newCustomer.name || !newCustomer.email) {
        throw new Error('Name and email are required')
      }

      const response = await fetch("http://localhost:8000/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create customer')
      }

      await fetchCustomers()
      setIsAddingCustomer(false)
      setNewCustomer({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
      })
    } catch (error) {
      console.error("Error adding customer:", error)
      setError(error instanceof Error ? error.message : 'Failed to create customer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Parts</h2>
        <Button onClick={() => setIsAddingPart(true)}>Create Part</Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Parts List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Setup Time</TableHead>
                    <TableHead>Cycle Time</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell>{part.part_number}</TableCell>
                      <TableCell>{part.description}</TableCell>
                      <TableCell>
                        {customers.find(c => c.id === part.customer_id)?.name || 'Loading...'}
                      </TableCell>
                      <TableCell>
                        {materials.find(m => m.id === part.material_id)?.name || 'Loading...'}
                      </TableCell>
                      <TableCell>{part.setup_time}</TableCell>
                      <TableCell>{part.cycle_time}</TableCell>
                      <TableCell>${part.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddingPart} onOpenChange={setIsAddingPart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Number</Label>
                <Input
                  value={newPart.part_number}
                  onChange={(e) =>
                    setNewPart({ ...newPart, part_number: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newPart.description}
                  onChange={(e) =>
                    setNewPart({ ...newPart, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {newPart.customer_id
                      ? customers.find(c => c.id.toString() === newPart.customer_id)?.name
                      : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search customers..." 
                      value={customerSearch}
                      onValueChange={setCustomerSearch}
                    />
                    <CommandEmpty>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left font-normal"
                        onClick={() => setIsAddingCustomer(true)}
                      >
                        Create "{customerSearch}"
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.id.toString()}
                          onSelect={(currentValue: string) => {
                            setNewPart({ ...newPart, customer_id: currentValue })
                            setCustomerSearch("")
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              newPart.customer_id === customer.id.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {customer.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Material</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {newPart.material_id
                      ? materials.find(m => m.id.toString() === newPart.material_id)?.name
                      : "Select material..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search materials..." 
                      value={materialSearch}
                      onValueChange={setMaterialSearch}
                    />
                    <CommandGroup>
                      {materials.map((material) => (
                        <CommandItem
                          key={material.id}
                          value={material.id.toString()}
                          onSelect={(currentValue: string) => {
                            setNewPart({ ...newPart, material_id: currentValue })
                            setMaterialSearch("")
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              newPart.material_id === material.id.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {material.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Setup Time (min)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newPart.setup_time}
                  onChange={(e) =>
                    setNewPart({ ...newPart, setup_time: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Cycle Time (min)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newPart.cycle_time}
                  onChange={(e) =>
                    setNewPart({ ...newPart, cycle_time: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPart.price}
                  onChange={(e) =>
                    setNewPart({ ...newPart, price: e.target.value })
                  }
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button 
              onClick={addPart}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Part'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newCustomer.name || customerSearch}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={newCustomer.contact}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, contact: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button 
              onClick={addCustomer}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 