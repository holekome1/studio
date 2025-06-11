
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
import { SearchFilterBar, ALL_CATEGORIES_VALUE, ALL_LOCATIONS_VALUE } from "@/components/inventory/search-filter-bar";
import type { Part } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const initialPartsData: Part[] = [
  { id: "1", name: "Spark Plug NGK CR7HSA", quantity: 50, price: 52500, storageLocation: "Shelf A-1", category: "Engine Parts" },
  { id: "2", name: "Oil Filter Honda OEM", quantity: 30, price: 134850, storageLocation: "Shelf B-2", category: "Engine Parts" },
  { id: "3", name: "Brake Pads Front Set", quantity: 25, price: 375000, storageLocation: "Shelf C-5", category: "Braking System" },
  { id: "4", name: "LED Headlight Bulb H4", quantity: 15, price: 299250, storageLocation: "Electrical A-1", category: "Electrical Components" },
  { id: "5", name: "Chain Lube Motul C2+", quantity: 40, price: 187500, storageLocation: "Fluids Rack 1", category: "Fluids & Chemicals" },
  { id: "6", name: "Motorcycle Cover Waterproof", quantity: 10, price: 525000, storageLocation: "Accessories Bin", category: "Accessories" },
  { id: "7", name: "Handlebar Grips Yamaha", quantity: 20, price: 236250, storageLocation: "Shelf D-3", category: "Body & Frame" },
  { id: "8", name: "Tire Pirelli Diablo Rosso III", quantity: 5, price: 2250000, storageLocation: "Tire Rack 2", category: "Wheels & Tires" },
  { id: "9", name: "Air Filter Twin Air", quantity: 18, price: 334500, storageLocation: "Shelf A-2", category: "Engine Parts" },
  { id: "10", name: "Battery Yuasa YTZ10S", quantity: 12, price: 1432500, storageLocation: "Electrical B-4", category: "Electrical Components" },
  { id: "11", name: "Kabel Rem Belakang", quantity: 22, price: 45000, storageLocation: "Gudang Kabel", category: "Braking System" },
  { id: "12", name: "Bohlam Sein (1 pasang)", quantity: 50, price: 25000, storageLocation: "Rak Bohlam", category: "Electrical Components" },
  { id: "13", name: "Spion Standar Kanan", quantity: 15, price: 75000, storageLocation: "Lemari Spion", category: "Body & Frame" },
  { id: "14", name: "Oli Mesin Federal Oil", quantity: 30, price: 65000, storageLocation: "Rak Oli", category: "Fluids & Chemicals" },
  { id: "15", name: "Kampas Kopling Set", quantity: 10, price: 250000, storageLocation: "Kotak Kopling", category: "Engine Parts" },
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
    const storedParts = localStorage.getItem("motorparts");
    if (storedParts) {
      setParts(JSON.parse(storedParts));
    } else {
      setParts(initialPartsData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("motorparts", JSON.stringify(parts));
  }, [parts]);

  const handleAddPart = (values: Omit<Part, "id">) => {
    const newPart: Part = { ...values, id: Date.now().toString() };
    setParts((prev) => [...prev, newPart]);
    setIsPartFormOpen(false);
    toast({ title: "Suku Cadang Ditambahkan", description: `${values.name} telah ditambahkan ke inventaris.` });
  };

  const handleEditPart = (values: Omit<Part, "id">) => {
    if (!editingPart) return;
    setParts((prev) =>
      prev.map((p) => (p.id === editingPart.id ? { ...editingPart, ...values } : p))
    );
    setIsPartFormOpen(false);
    setEditingPart(undefined);
    toast({ title: "Suku Cadang Diperbarui", description: `${values.name} telah diperbarui.` });
  };

  const handleDeletePart = () => {
    if (!partToDeleteId) return;
    const partName = parts.find(p => p.id === partToDeleteId)?.name || "Suku Cadang";
    setParts((prev) => prev.filter((p) => p.id !== partToDeleteId));
    setPartToDeleteId(null);
    toast({ title: "Suku Cadang Dihapus", description: `${partName} telah dihapus dari inventaris.`, variant: "destructive" });
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

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value === ALL_CATEGORIES_VALUE ? "" : value);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value === ALL_LOCATIONS_VALUE ? "" : value);
  };

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-headline text-3xl font-bold">Manajemen Inventaris</h1>
        <Button onClick={() => { setEditingPart(undefined); setIsPartFormOpen(true); }}>
          <PlusCircle className="mr-2 h-5 w-5" /> Tambah Suku Cadang Baru
        </Button>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter === "" ? ALL_CATEGORIES_VALUE : categoryFilter}
        onCategoryChange={handleCategoryChange}
        locationFilter={locationFilter === "" ? ALL_LOCATIONS_VALUE : locationFilter}
        onLocationChange={handleLocationChange}
        availableLocations={availableLocations}
      />

      <PartTable parts={filteredParts} onEdit={openEditForm} onDelete={openDeleteConfirm} />

      <Dialog open={isPartFormOpen} onOpenChange={setIsPartFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              {editingPart ? "Edit Suku Cadang" : "Tambah Suku Cadang Baru"}
            </DialogTitle>
            {editingPart && <DialogDescription>Perbarui detail untuk {editingPart.name}.</DialogDescription>}
            {!editingPart && <DialogDescription>Masukkan detail untuk suku cadang baru.</DialogDescription>}
            
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
            <AlertDialogTitle>Apakah Anda yakin ingin menghapus suku cadang ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus suku cadang secara permanen
              "{parts.find(p => p.id === partToDeleteId)?.name || ''}" dari inventaris Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartToDeleteId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePart} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;

    