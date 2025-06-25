
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDocs, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

const Home: NextPage = () => {
  const [parts, setParts] = useState<Part[]>([]);
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

  // Fetch data from Firestore
  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const partsCollection = collection(db, "parts");
    setIsLoading(true);
    const unsubscribeParts = onSnapshot(query(partsCollection), (snapshot) => {
      const partsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Part));
      setParts(partsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching parts:", error);
      toast({ title: "Gagal Memuat Data", description: "Tidak dapat mengambil data inventaris dari server.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribeParts();
  }, [toast]);

  const createTransaction = useCallback(async (newTransaction: Omit<TransactionRecord, 'id' | 'timestamp' | 'totalAmount'> & { notes?: string }) => {
    if (!db) return;
    const transactionsCollection = collection(db, "transactions");
    try {
      const totalAmount = newTransaction.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const fullTransaction: Omit<TransactionRecord, 'id'> = {
        ...newTransaction,
        timestamp: Date.now(),
        totalAmount
      };
      await addDoc(transactionsCollection, fullTransaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({ title: "Gagal Membuat Transaksi", description: "Terjadi kesalahan saat menyimpan transaksi.", variant: "destructive" });
    }
  }, [toast]);

  const handleAddPart = async (values: PartFormValues) => {
    if (!db) return;
    const partsCollection = collection(db, "parts");
    try {
      // Check if part with the same name already exists
      const q = query(partsCollection, where("name", "==", values.name.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Part exists, update quantity
        const existingDoc = querySnapshot.docs[0];
        const existingPart = { id: existingDoc.id, ...existingDoc.data() } as Part;
        const newQuantity = existingPart.quantity + values.quantity;
        
        await updateDoc(doc(db, "parts", existingPart.id), {
          quantity: newQuantity,
          price: values.price,
          storageLocation: values.storageLocation,
          category: values.category,
          minStock: values.minStock,
        });

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
        // Part doesn't exist, add new part
        const newPartDoc = await addDoc(partsCollection, values);
        await createTransaction({
          type: 'in',
          items: [{ partId: newPartDoc.id, partName: values.name, quantity: values.quantity, price: values.price }],
          notes: 'Suku cadang baru ditambahkan',
        });
        toast({
          title: "Suku Cadang Ditambahkan",
          description: `${values.name} telah ditambahkan ke inventaris.`,
        });
      }
      setIsPartFormOpen(false);
    } catch (error) {
      console.error("Error adding/updating part:", error);
      toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan suku cadang.", variant: "destructive" });
    }
  };


  const handleEditPart = async (values: PartFormValues) => {
    if (!editingPart?.id || !db) return;
    
    try {
      const oldPart = parts.find(p => p.id === editingPart.id);
      if (!oldPart) return;

      const partRef = doc(db, "parts", editingPart.id);
      await updateDoc(partRef, values as Partial<Part>);

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
    if (!partToDeleteId || !db) return;
    
    try {
      const partToDelete = parts.find(p => p.id === partToDeleteId);
      if (!partToDelete) return;

      await deleteDoc(doc(db, "parts", partToDeleteId));
      
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
    if (items.length === 0 || !db) return;

    try {
      const lowStockAlerts: string[] = [];
      const batch = writeBatch(db);

      for (const item of items) {
        const partRef = doc(db, "parts", item.partId);
        const partDoc = await getDoc(partRef); // Use getDoc within a loop for transactions
        if (partDoc.exists()) {
          const part = partDoc.data() as Omit<Part, 'id'>;
          const newQuantity = part.quantity - item.quantity;
          if (newQuantity < 0) {
            // This toast will be shown before the transaction is even attempted.
            toast({ title: "Stok Tidak Cukup", description: `Stok untuk ${part.name} hanya ${part.quantity}.`, variant: "destructive" });
            return; // Stop the whole transaction
          }
          if (newQuantity <= part.minStock) {
            lowStockAlerts.push(`${part.name} (sisa ${newQuantity})`);
          }
          batch.update(partRef, { quantity: newQuantity });
        }
      }
      
      await batch.commit();

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
