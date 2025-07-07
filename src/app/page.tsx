
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { PlusCircle, ArrowRightLeft } from "lucide-react";
import { TransactionForm } from "@/components/inventory/transaction-form";
import type { PartFormValues } from "@/components/inventory/part-form";
import { Badge } from "@/components/ui/badge";

// LocalStorage Helper Functions
const getStoredData = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return fallback;
  }
};

const storeData = <T,>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};


const Home: NextPage = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>(undefined);
  const [partToDeleteId, setPartToDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from localStorage on initial render
  useEffect(() => {
    setParts(getStoredData<Part[]>('inventory_parts', []));
    setTransactions(getStoredData<TransactionRecord[]>('inventory_transactions', []));
    setIsLoading(false);
  }, []);

  const createTransaction = useCallback((newTransaction: Omit<TransactionRecord, 'id' | 'timestamp' | 'totalAmount'> & { notes?: string }) => {
    try {
      const totalAmount = newTransaction.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const fullTransaction: TransactionRecord = {
        ...newTransaction,
        id: `trans_${Date.now()}`,
        timestamp: Date.now(),
        totalAmount
      };
      
      setTransactions(prev => {
        const updated = [...prev, fullTransaction];
        storeData('inventory_transactions', updated);
        return updated;
      });

    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({ title: "Gagal Membuat Transaksi", description: "Terjadi kesalahan saat menyimpan transaksi.", variant: "destructive" });
    }
  }, [toast]);

  const handleAddPart = async (values: PartFormValues) => {
    try {
      const { barcode } = values;
      if (barcode) {
        const existingBarcodePart = parts.find(p => p.barcode === barcode);
        if (existingBarcodePart) {
           toast({ title: "Barcode Duplikat", description: `Barcode ini sudah digunakan untuk barang: ${existingBarcodePart.name}.`, variant: "destructive" });
           return;
        }
      }

      const existingPart = parts.find(p => p.name.toLowerCase() === values.name.trim().toLowerCase());
      
      let updatedParts: Part[];
      if (existingPart) {
        // Update existing part
        updatedParts = parts.map(p => 
          p.id === existingPart.id
          ? { ...p, 
              quantity: p.quantity + values.quantity,
              price: values.price,
              storageLocation: values.storageLocation,
              category: values.category,
              minStock: values.minStock,
              barcode: values.barcode || p.barcode
            }
          : p
        );
        
        await createTransaction({
          type: 'in',
          items: [{ partId: existingPart.id, partName: existingPart.name, quantity: values.quantity, price: values.price }],
          notes: `Penambahan stok untuk barang yang sudah ada: ${existingPart.name}`,
        });

        toast({
          title: "Stok Diperbarui",
          description: `Jumlah untuk ${existingPart.name} telah ditambahkan.`,
        });

      } else {
        // Add new part
        const newPart: Part = {
          id: `part_${Date.now()}`,
          ...values,
        };
        updatedParts = [...parts, newPart];

        await createTransaction({
          type: 'in',
          items: [{ partId: newPart.id, partName: newPart.name, quantity: values.quantity, price: values.price }],
          notes: 'Suku cadang baru ditambahkan',
        });
        toast({
          title: "Suku Cadang Ditambahkan",
          description: `${values.name} telah ditambahkan ke inventaris.`,
        });
      }
      setParts(updatedParts);
      storeData('inventory_parts', updatedParts);
      setIsPartFormOpen(false);

    } catch (error) {
      console.error("Error adding/updating part:", error);
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan suku cadang.", variant: "destructive" });
    }
  };


  const handleEditPart = async (values: PartFormValues) => {
    if (!editingPart?.id) return;
    
    try {
       const { barcode } = values;
       if (barcode) {
         const existingBarcodePart = parts.find(p => p.barcode === barcode && p.id !== editingPart.id);
         if (existingBarcodePart) {
            toast({ title: "Barcode Duplikat", description: `Barcode ini sudah digunakan untuk barang: ${existingBarcodePart.name}.`, variant: "destructive" });
            return;
         }
       }

      const oldPart = parts.find(p => p.id === editingPart.id);
      if (!oldPart) return;

      const updatedParts = parts.map(p => p.id === editingPart.id ? { ...p, ...values } : p);
      setParts(updatedParts);
      storeData('inventory_parts', updatedParts);

      const quantityChange = values.quantity - oldPart.quantity;
      if (quantityChange !== 0) {
        await createTransaction({
          type: quantityChange > 0 ? 'in' : 'out',
          items: [{ partId: editingPart.id, partName: values.name, quantity: Math.abs(quantityChange), price: values.price }],
          notes: 'Penyesuaian stok manual'
        });
      }
      
      if (values.quantity <= values.minStock) {
          toast({
              title: "Stok Menipis!",
              description: `Jumlah ${values.name} telah mencapai batas minimum (${values.minStock}).`,
              variant: "destructive"
          });
      }

      setIsPartFormOpen(false);
      setEditingPart(undefined);
      toast({ title: "Suku Cadang Diperbarui", description: `${values.name} telah diperbarui.` });
    } catch(error) {
       console.error("Error editing part:", error);
       toast({ title: "Gagal Memperbarui", description: "Terjadi kesalahan saat memperbarui suku cadang.", variant: "destructive" });
    }
  };

  const handleDeletePart = async () => {
    if (!partToDeleteId) return;
    
    try {
      const partToDelete = parts.find(p => p.id === partToDeleteId);
      if (!partToDelete) return;
      
      const updatedParts = parts.filter(p => p.id !== partToDeleteId);
      setParts(updatedParts);
      storeData('inventory_parts', updatedParts);
      
      await createTransaction({
        type: 'out',
        items: [{ partId: partToDelete.id, partName: partToDelete.name, quantity: partToDelete.quantity, price: partToDelete.price }],
        notes: `Suku cadang ${partToDelete.name} dihapus`
      });
      
      setPartToDeleteId(null);
      toast({ title: "Suku Cadang Dihapus", description: `${partToDelete.name} telah dihapus dari inventaris.`, variant: "destructive" });
    } catch (error) {
      console.error("Error deleting part:", error);
      toast({ title: "Gagal Menghapus", description: "Terjadi kesalahan saat menghapus suku cadang.", variant: "destructive" });
    }
  };

  const handleCreateTransaction = async (items: TransactionItem[]) => {
    if (items.length === 0) return;

    try {
      const lowStockAlerts: string[] = [];
      const updatedParts = [...parts];
      let transactionValid = true;

      for (const item of items) {
        const partIndex = updatedParts.findIndex(p => p.id === item.partId);
        if (partIndex > -1) {
          const part = updatedParts[partIndex];
          const newQuantity = part.quantity - item.quantity;
          if (newQuantity < 0) {
            toast({ title: "Stok Tidak Cukup", description: `Stok untuk ${part.name} hanya ${part.quantity}.`, variant: "destructive" });
            transactionValid = false;
            break; 
          }
          if (newQuantity <= part.minStock) {
            lowStockAlerts.push(`${part.name} (sisa ${newQuantity})`);
          }
          updatedParts[partIndex] = { ...part, quantity: newQuantity };
        }
      }
      
      if (!transactionValid) return;

      setParts(updatedParts);
      storeData('inventory_parts', updatedParts);

      await createTransaction({
        type: 'out',
        items: items,
        notes: 'Transaksi penjualan/keluar'
      });

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
    } catch (error: any) {
        console.error("Error creating transaction:", error);
        toast({ title: "Transaksi Gagal", description: error.message || "Terjadi kesalahan saat membuat transaksi.", variant: "destructive" });
    }
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
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = part.name.toLowerCase().includes(searchLower);
      const barcodeMatch = part.barcode?.toLowerCase().includes(searchLower);
      const categoryMatch = categoryFilter ? part.category === categoryFilter : true;
      const locationMatch = locationFilter ? part.storageLocation === locationFilter : true;
      return (nameMatch || barcodeMatch) && categoryMatch && locationMatch;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [parts, searchTerm, categoryFilter, locationFilter]);
  
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value === ALL_CATEGORIES_VALUE ? "" : value);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value === ALL_LOCATIONS_VALUE ? "" : value);
  };


  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Memuat data inventaris...</div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-3xl font-bold">Manajemen Inventaris</h1>
           {user?.role === 'manajer' && (
              <Badge variant="outline" className="border-accent text-accent-foreground text-sm font-semibold">
                Mode Hanya Lihat
              </Badge>
            )}
        </div>
        <div className="flex gap-2">
          {user?.role !== 'manajer' && (
            <>
              <Button onClick={() => setIsTransactionFormOpen(true)}>
                <ArrowRightLeft className="mr-2 h-5 w-5" /> barang keluar
              </Button>
              {user?.role === 'admin' && (
                <Button onClick={() => { setEditingPart(undefined); setIsPartFormOpen(true); }}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Tambah Suku Cadang
                </Button>
              )}
            </>
          )}
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

      <PartTable parts={filteredParts} onEdit={openEditForm} onDelete={openDeleteConfirm} userRole={user?.role} />

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
             <DialogDescription>Pindai barcode atau pilih suku cadang dan jumlah yang akan dikeluarkan dari inventaris.</DialogDescription>
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
