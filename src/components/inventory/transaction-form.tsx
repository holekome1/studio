
"use client";

import React, { useState } from "react";
import type { Part, TransactionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Barcode, PlusCircle, Trash2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface TransactionFormProps {
  parts: Part[];
  onSubmit: (items: TransactionItem[]) => void;
  onCancel: () => void;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function TransactionForm({ parts, onSubmit, onCancel }: TransactionFormProps) {
  const [cartItems, setCartItems] = useState<TransactionItem[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [barcodeInput, setBarcodeInput] = useState("");
  const { toast } = useToast();

  const addItemToCart = (partToAdd: Part, qty: number): boolean => {
    if (!partToAdd) return false;

    const existingCartItem = cartItems.find(item => item.partId === partToAdd.id);
    const currentCartQuantity = existingCartItem?.quantity || 0;

    if (qty + currentCartQuantity > partToAdd.quantity) {
      toast({ title: "Stok Tidak Cukup", description: `Stok ${partToAdd.name} hanya tersisa ${partToAdd.quantity}.`, variant: "destructive" });
      return false;
    }

    if (existingCartItem) {
      setCartItems(cartItems.map(item =>
        item.partId === partToAdd.id ? { ...item, quantity: item.quantity + qty } : item
      ));
    } else {
      const newItem: TransactionItem = {
        partId: partToAdd.id,
        partName: partToAdd.name,
        quantity: qty,
        price: partToAdd.price,
      };
      setCartItems([...cartItems, newItem]);
    }
    return true;
  };
  
  const handleAddItemManual = () => {
    if (!selectedPartId || quantity <= 0) {
      toast({ title: "Input Tidak Valid", description: "Pilih suku cadang dan masukkan jumlah yang valid.", variant: "destructive" });
      return;
    }
    const part = parts.find(p => p.id === selectedPartId);
    if(part && addItemToCart(part, quantity)) {
        setSelectedPartId("");
        setQuantity(1);
    }
  };
  
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim() !== '') {
      e.preventDefault();
      const part = parts.find(p => p.barcode === barcodeInput.trim());
      if (part) {
        if (addItemToCart(part, 1)) { // Automatically add 1 item on scan
          toast({ title: "Item Ditambahkan", description: `${part.name} ditambahkan ke keranjang.` });
          setBarcodeInput(""); // Clear input after successful scan
        }
      } else {
        toast({ title: "Barcode Tidak Ditemukan", description: "Suku cadang dengan barcode ini tidak ada di inventaris.", variant: "destructive" });
      }
    }
  };

  const handleRemoveItem = (partId: string) => {
    setCartItems(cartItems.filter(item => item.partId !== partId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast({ title: "Transaksi Kosong", description: "Tambahkan setidaknya satu item ke transaksi.", variant: "destructive" });
      return;
    }
    onSubmit(cartItems);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="relative">
          <Barcode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pindai barcode lalu tekan Enter..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeKeyDown}
            className="pl-10 text-base"
          />
        </div>
      
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ATAU</span>
        <Separator className="flex-1" />
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Pilih Manual</label>
           <Select value={selectedPartId} onValueChange={setSelectedPartId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih suku cadang..." />
            </SelectTrigger>
            <SelectContent>
              {parts.filter(p => p.quantity > 0).map(part => (
                <SelectItem key={part.id} value={part.id}>
                  {part.name} (Stok: {part.quantity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-24">
            <label className="text-sm font-medium">Jumlah</label>
           <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
          />
        </div>
        <Button type="button" onClick={handleAddItemManual} size="icon">
          <PlusCircle className="h-5 w-5"/>
           <span className="sr-only">Tambah Item</span>
        </Button>
      </div>

       {cartItems.length > 0 && (
         <div className="space-y-2">
            <h3 className="text-lg font-medium">Item Transaksi</h3>
             <ScrollArea className="h-64 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-center">Jumlah</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map(item => (
                    <TableRow key={item.partId}>
                      <TableCell className="font-medium">{item.partName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatRupiah(item.price * item.quantity)}</TableCell>
                       <TableCell className="text-right">
                         <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.partId)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                         </Button>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
             <div className="text-right font-bold text-lg pr-4">
                Total: {formatRupiah(totalAmount)}
             </div>
         </div>
       )}

        {cartItems.length === 0 && (
             <div className="flex flex-col items-center justify-center p-10 text-center h-[200px] border-dashed border-2 rounded-md">
                <XCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-muted-foreground">Belum ada item</h3>
                <p className="text-muted-foreground">Pindai barcode atau pilih suku cadang untuk ditambahkan.</p>
              </div>
        )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={cartItems.length === 0}>
          Selesaikan Transaksi
        </Button>
      </div>
    </form>
  );
}
