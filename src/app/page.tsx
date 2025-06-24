
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import type { Part, TransactionRecord, TransactionItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, ArrowRightLeft } from "lucide-react";
import { TransactionForm } from "@/components/inventory/transaction-form";
import type { PartFormValues } from "@/components/inventory/part-form";

const initialPartsData: Part[] = [
  { id: "1", name: "Spark Plug NGK CR7HSA", quantity: 50, price: 52500, storageLocation: "Rak A-1", category: "Engine Parts", minStock: 10 },
  { id: "2", name: "Oil Filter Honda OEM", quantity: 30, price: 134850, storageLocation: "Rak B-2", category: "Engine Parts", minStock: 5 },
  { id: "3", name: "Brake Pads Front Set", quantity: 25, price: 375000, storageLocation: "Rak C-5", category: "Braking System", minStock: 10 },
  { id: "4", name: "LED Headlight Bulb H4", quantity: 8, price: 299250, storageLocation: "Rak Elektrikal A-1", category: "Electrical Components", minStock: 5 },
  { id: "5", name: "Chain Lube Motul C2+", quantity: 40, price: 187500, storageLocation: "Rak Cairan 1", category: "Fluids & Chemicals", minStock: 15 },
  { id: "6", name: "Motorcycle Cover Waterproof", quantity: 10, price: 525000, storageLocation: "Kotak Aksesoris", category: "Accessories", minStock: 2 },
  { id: "7", name: "Handlebar Grips Yamaha", quantity: 20, price: 236250, storageLocation: "Rak D-3", category: "Body & Frame", minStock: 5 },
  { id: "8", name: "Tire Pirelli Diablo Rosso III", quantity: 5, price: 2250000, storageLocation: "Rak Ban 2", category: "Wheels & Tires", minStock: 4 },
  { id: "9", name: "Air Filter Twin Air", quantity: 18, price: 334500, storageLocation: "Rak A-2", category: "Engine Parts", minStock: 5 },
  { id: "10", name: "Battery Yuasa YTZ10S", quantity: 12, price: 1432500, storageLocation: "Rak Elektrikal B-4", category: "Electrical Components", minStock: 3 },
  { id: "11", name: "Kabel Rem Belakang", quantity: 22, price: 45000, storageLocation: "Gudang Kabel", category: "Braking System", minStock: 10 },
  { id: "12", name: "Bohlam Sein (1 pasang)", quantity: 3, price: 25000, storageLocation: "Rak Bohlam", category: "Electrical Components", minStock: 10 },
  { id: "13", name: "Spion Standar Kanan", quantity: 15, price: 75000, storageLocation: "Lemari Spion", category: "Body & Frame", minStock: 5 },
  { id: "14", name: "Oli Mesin Federal Oil", quantity: 30, price: 65000, storageLocation: "Rak Oli", category: "Fluids & Chemicals", minStock: 12 },
  { id: "15", name: "Kampas Kopling Set", quantity: 10, price: 250000, storageLocation: "Kotak Kopling", category: "Engine Parts", minStock: 5 },
  { id: "16", name: "Gear Set SSS 428", quantity: 8, price: 450000, storageLocation: "Lemari Gear", category: "Engine Parts", minStock: 3},
  { id: "17", name: "Shockbreaker Belakang YSS", quantity: 6, price: 850000, storageLocation: "Rak Suspensi Heavy Duty", category: "Suspension", minStock: 2},
  { id: "18", name: "Klakson Denso", quantity: 25, price: 95000, storageLocation: "Laci Klakson", category: "Electrical Components", minStock: 5},
  { id: "19", name: "Jas Hujan Axio", quantity: 12, price: 220000, storageLocation: "Gantungan Jas Hujan", category: "Accessories", minStock: 5},
  { id: "20", name: "Pelumas Rantai Top1", quantity: 4, price: 35000, storageLocation: "Area Perawatan", category: "Fluids & Chemicals", minStock: 5},
];

const Home: NextPage = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [transactionRecords, setTransactionRecords] = useState<TransactionRecord[]>([]);
  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>(undefined);
  const [partToDeleteId, setPartToDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const hasLoaded = useRef(false);

  const { toast } = useToast();

  useEffect(() => {
    const storedParts = localStorage.getItem("motorparts");
    const storedTransactions = localStorage.getItem("motorparts_transaction_records");
    if (storedParts) {
      setParts(JSON.parse(storedParts));
    } else {
      setParts(initialPartsData);
    }
    if (storedTransactions) {
        setTransactionRecords(JSON.parse(storedTransactions));
    }
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (hasLoaded.current) {
      localStorage.setItem("motorparts", JSON.stringify(parts));
    }
  }, [parts]);

  useEffect(() => {
    if (hasLoaded.current) {
        localStorage.setItem("motorparts_transaction_records", JSON.stringify(transactionRecords));
    }
  }, [transactionRecords]);

  const createTransaction = (newTransaction: Omit<TransactionRecord, 'id' | 'timestamp' | 'totalAmount'> & { notes?: string }) => {
    const totalAmount = newTransaction.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fullTransaction: TransactionRecord = {
      ...newTransaction,
      id: `TXN-${Date.now()}`,
      timestamp: Date.now(),
      totalAmount
    };
    setTransactionRecords(prev => [...prev, fullTransaction]);
  };
  
  const handleAddPart = (values: PartFormValues) => {
    const newPart: Part = { ...values, id: Date.now().toString() };
    setParts((prev) => [...prev, newPart]);
    
    createTransaction({
      type: 'in',
      items: [{ partId: newPart.id, partName: newPart.name, quantity: newPart.quantity, price: newPart.price }],
      notes: 'Suku cadang baru ditambahkan'
    });

    setIsPartFormOpen(false);
    toast({ title: "Suku Cadang Ditambahkan", description: `${values.name} telah ditambahkan ke inventaris.` });
  };

  const handleEditPart = (values: PartFormValues) => {
    if (!editingPart) return;
    
    const oldPart = parts.find(p => p.id === editingPart.id);
    if (!oldPart) return;
    
    const oldQuantity = oldPart.quantity;
    const updatedPart: Part = { ...editingPart, ...values };
    
    setParts((prev) =>
      prev.map((p) => (p.id === editingPart.id ? updatedPart : p))
    );

    const quantityChange = updatedPart.quantity - oldQuantity;
    if (quantityChange !== 0) {
      createTransaction({
        type: quantityChange > 0 ? 'in' : 'out',
        items: [{ partId: updatedPart.id, partName: updatedPart.name, quantity: Math.abs(quantityChange), price: updatedPart.price }],
        notes: 'Penyesuaian stok manual'
      });
    }
    
    if (updatedPart.quantity <= updatedPart.minStock) {
        toast({
            title: "Stok Menipis!",
            description: `Jumlah ${updatedPart.name} telah mencapai batas minimum (${updatedPart.minStock}).`,
            variant: "destructive"
        });
    }

    setIsPartFormOpen(false);
    setEditingPart(undefined);
    toast({ title: "Suku Cadang Diperbarui", description: `${values.name} telah diperbarui.` });
  };

  const handleDeletePart = () => {
    if (!partToDeleteId) return;
    const partToDelete = parts.find(p => p.id === partToDeleteId);
    if (!partToDelete) return;
    
    createTransaction({
      type: 'out',
      items: [{ partId: partToDelete.id, partName: partToDelete.name, quantity: partToDelete.quantity, price: partToDelete.price }],
      notes: `Suku cadang ${partToDelete.name} dihapus`
    });
    
    setParts((prev) => prev.filter((p) => p.id !== partToDeleteId));
    setPartToDeleteId(null);
    toast({ title: "Suku Cadang Dihapus", description: `${partToDelete.name} telah dihapus dari inventaris.`, variant: "destructive" });
  };

  const handleCreateTransaction = (items: TransactionItem[]) => {
    if (items.length === 0) return;

    // 1. Create transaction record
    createTransaction({
      type: 'out',
      items: items,
      notes: 'Transaksi penjualan/keluar'
    });

    // 2. Update part quantities
    const newParts = [...parts];
    let lowStockAlerts: string[] = [];

    items.forEach(item => {
      const partIndex = newParts.findIndex(p => p.id === item.partId);
      if (partIndex !== -1) {
        const newQuantity = newParts[partIndex].quantity - item.quantity;
        newParts[partIndex].quantity = newQuantity;

        if (newQuantity <= newParts[partIndex].minStock) {
          lowStockAlerts.push(`${newParts[partIndex].name} (sisa ${newQuantity})`);
        }
      }
    });
    setParts(newParts);

    // 3. Show toasts
    toast({ title: "Transaksi Berhasil", description: `${items.length} item telah dikeluarkan dari gudang.` });
    if(lowStockAlerts.length > 0) {
       toast({
            title: "Stok Menipis!",
            description: `Beberapa stok menipis: ${lowStockAlerts.join(', ')}.`,
            variant: "destructive",
            duration: 5000
        });
    }

    setIsTransactionFormOpen(false);
  }

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
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-2">
        <h1 className="font-headline text-3xl font-bold">Manajemen Inventaris</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsTransactionFormOpen(true)}>
            <ArrowRightLeft className="mr-2 h-5 w-5" /> Buat Transaksi Keluar
          </Button>
          <Button onClick={() => { setEditingPart(undefined); setIsPartFormOpen(true); }}>
            <PlusCircle className="mr-2 h-5 w-5" /> Tambah Suku Cadang
          </Button>
        </div>
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

      {/* Part Add/Edit Dialog */}
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
      
      {/* Outgoing Transaction Dialog */}
      <Dialog open={isTransactionFormOpen} onOpenChange={setIsTransactionFormOpen}>
        <DialogContent className="sm:max-w-2xl">
           <DialogHeader>
             <DialogTitle className="font-headline text-2xl">Buat Transaksi Keluar</DialogTitle>
             <DialogDescription>Pilih suku cadang dan jumlah yang akan dikeluarkan dari inventaris.</DialogDescription>
           </DialogHeader>
            <div className="mt-4">
              <TransactionForm
                parts={parts}
                onSubmit={handleCreateTransaction}
                onCancel={() => setIsTransactionFormOpen(false)}
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
