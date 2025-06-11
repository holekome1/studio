
"use client";

import type * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Package } from "lucide-react";
import type { Part } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PartTableProps {
  parts: Part[];
  onEdit: (part: Part) => void;
  onDelete: (partId: string) => void;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function PartTable({ parts, onEdit, onDelete }: PartTableProps) {
  if (parts.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-muted-foreground">Tidak Ada Suku Cadang di Inventaris</h3>
          <p className="text-muted-foreground">Tambahkan suku cadang baru untuk memulai.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Daftar Inventaris</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{part.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{part.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(part.price)}
                  </TableCell>
                  <TableCell>{part.storageLocation}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(part)}
                      aria-label={`Edit ${part.name}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(part.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label={`Hapus ${part.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    