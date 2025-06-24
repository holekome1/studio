
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TransactionRecord } from "@/types";
import { Printer, Receipt } from "lucide-react";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short'
    })
}

export default function TransactionsPage() {
  const [records, setRecords] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    const storedRecords = localStorage.getItem("motorparts_transaction_records");
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords).sort((a: TransactionRecord, b: TransactionRecord) => b.timestamp - a.timestamp));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Riwayat Transaksi</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua Transaksi</CardTitle>
          <CardDescription>Mencatat semua aktivitas barang masuk dan keluar dari inventaris.</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Transaksi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Jumlah Item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">{record.id}</TableCell>
                    <TableCell>
                      <Badge variant={record.type === 'in' ? 'secondary' : 'default'}>
                        {record.type === 'in' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell className="text-center">{record.items.length}</TableCell>
                    <TableCell className="text-right">{formatRupiah(record.totalAmount)}</TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="ghost" size="icon">
                         <Link href={`/transactions/${record.id}/print`} target="_blank">
                           <Printer className="h-4 w-4" />
                            <span className="sr-only">Cetak Struk</span>
                         </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center h-[400px]">
              <Receipt className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-muted-foreground">Belum Ada Riwayat Transaksi</h3>
              <p className="text-muted-foreground">Data transaksi akan muncul di sini setelah Anda melakukan aktivitas inventaris.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
