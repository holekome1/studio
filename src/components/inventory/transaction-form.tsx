
"use client";

import { useState } from "react";
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
import { PlusCircle, Trash2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

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
  const { toast } = useToast();

  const handleAddItem = () => {
    if (!selectedPartId || quantity <= 0) {
      toast({ title: "Input Tidak Valid", description: "Pilih suku cadang dan masukkan jumlah yang valid.", variant: "destructive" });
      return;
    }

    const part = parts.find(p => p.id === selectedPartId);
    if (!part) return;

    const existingCartItem = cartItems.find(item => item.partId === selectedPartId);
    const currentCartQuantity = existingCartItem?.quantity || 0;
    
    if (quantity + currentCartQuantity > part.quantity) {
      toast({ title: "Stok Tidak Cukup", description: `Stok ${part.name} hanya tersisa ${part.quantity}.`, variant: "destructive" });
      return;
    }

    if (existingCartItem) {
      setCartItems(cartItems.map(item =>
        item.partId === selectedPartId ? { ...item, quantity: item.quantity + quantity } : item
      ));
    } else {
      const newItem: TransactionItem = {
        partId: part.id,
        partName: part.name,
        quantity: quantity,
        price: part.price,
      };
      setCartItems([...cartItems, newItem]);
    }
    
    // Reset form
    setSelectedPartId("");
    setQuantity(1);
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
      {/* Part selection and quantity */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Suku Cadang</label>
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
        <Button type="button" onClick={handleAddItem} size="icon">
          <PlusCircle className="h-5 w-5"/>
           <span className="sr-only">Tambah Item</span>
        </Button>
      </div>

      {/* Cart Items Table */}
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
                <p className="text-muted-foreground">Pilih suku cadang untuk ditambahkan ke transaksi.</p>
              </div>
        )}

      {/* Form Actions */}
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
