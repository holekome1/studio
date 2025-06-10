"use client";

import { useState, useMemo, useEffect } from "react";
import type { NextPage } from "next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PartForm } from "@/components/inventory/part-form";
import { PartTable } from "@/components/inventory/part-table";
import { SearchFilterBar } from "@/components/inventory/search-filter-bar";
import type { Part, PartCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const initialPartsData: Part[] = [
  { id: "1", name: "Spark Plug NGK CR7HSA", quantity: 50, price: 3.50, storageLocation: "Shelf A-1", category: "Engine Parts" },
  { id: "2", name: "Oil Filter Honda OEM", quantity: 30, price: 8.99, storageLocation: "Shelf B-2", category: "Engine Parts" },
  { id: "3", name: "Brake Pads Front Set", quantity: 25, price: 25.00, storageLocation: "Shelf C-5", category: "Braking System" },
  { id: "4", name: "LED Headlight Bulb H4", quantity: 15, price: 19.95, storageLocation: "Electrical A-1", category: "Electrical Components" },
  { id: "5", name: "Chain Lube Motul C2+", quantity: 40, price: 12.50, storageLocation: "Fluids Rack 1", category: "Fluids & Chemicals" },
];

const Home: NextPage = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>(undefined);
  const [partToDeleteId, setPartToDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");

  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading initial data or fetching from local storage
    const storedParts = localStorage.getItem("motorparts");
    if (storedParts) {
      setParts(JSON.parse(storedParts));
    } else {
      setParts(initialPartsData);
    }
  }, []);

  useEffect(() => {
    // Save parts to local storage whenever they change
    localStorage.setItem("motorparts", JSON.stringify(parts));
  }, [parts]);

  const handleAddPart = (values: Omit<Part, "id">) => {
    const newPart: Part = { ...values, id: Date.now().toString() };
    setParts((prev) => [...prev, newPart]);
    setIsPartFormOpen(false);
    toast({ title: "Part Added", description: `${values.name} has been added to inventory.` });
  };

  const handleEditPart = (values: Omit<Part, "id">) => {
    if (!editingPart) return;
    setParts((prev) =>
      prev.map((p) => (p.id === editingPart.id ? { ...editingPart, ...values } : p))
    );
    setIsPartFormOpen(false);
    setEditingPart(undefined);
    toast({ title: "Part Updated", description: `${values.name} has been updated.` });
  };

  const handleDeletePart = () => {
    if (!partToDeleteId) return;
    const partName = parts.find(p => p.id === partToDeleteId)?.name || "Part";
    setParts((prev) => prev.filter((p) => p.id !== partToDeleteId));
    setPartToDeleteId(null);
    toast({ title: "Part Deleted", description: `${partName} has been removed from inventory.`, variant: "destructive" });
  };

  const openEditForm = (part: Part) => {
    setEditingPart(part);
    setIsPartFormOpen(true);
  };

  const openDeleteConfirm = (partId: string) => {
    setPartToDeleteId(partId);
  };

  const availableLocations = useMemo(() => {
    const locations = new Set(parts.map(part => part.storageLocation));
    return Array.from(locations).sort();
  }, [parts]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const nameMatch = part.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = categoryFilter ? part.category === categoryFilter : true;
      const locationMatch = locationFilter ? part.storageLocation === locationFilter : true;
      return nameMatch && categoryMatch && locationMatch;
    });
  }, [parts, searchTerm, categoryFilter, locationFilter]);

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-headline text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => { setEditingPart(undefined); setIsPartFormOpen(true); }}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Part
        </Button>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        availableLocations={availableLocations}
      />

      <PartTable parts={filteredParts} onEdit={openEditForm} onDelete={openDeleteConfirm} />

      <Dialog open={isPartFormOpen} onOpenChange={setIsPartFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {editingPart ? "Edit Part" : "Add New Part"}
            </DialogTitle>
            {editingPart && <DialogDescription>Update the details for {editingPart.name}.</DialogDescription>}
            {!editingPart && <DialogDescription>Enter the details for the new spare part.</DialogDescription>}
            
          </DialogHeader>
          <div className="mt-4">
            <PartForm
              onSubmit={editingPart ? handleEditPart : handleAddPart}
              onCancel={() => setIsPartFormOpen(false)}
              initialData={editingPart}
              isEditing={!!editingPart}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!partToDeleteId} onOpenChange={() => setPartToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this part?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the part
              "{parts.find(p => p.id === partToDeleteId)?.name || ''}" from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePart} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
