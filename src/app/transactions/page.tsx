
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  isWithinInterval
} from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TransactionRecord } from "@/types";
import { Printer, Receipt } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

const getStoredTransactions = (): TransactionRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('inventory_transactions');
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse transactions from localStorage", e);
    return [];
  }
};


export default function TransactionsPage() {
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const storedRecords = getStoredTransactions();
    // Sort records by timestamp descending
    const sortedRecords = storedRecords.sort((a, b) => b.timestamp - a.timestamp);
    setRecords(sortedRecords);
    setIsLoading(false);
  }, []);

  const filteredRecords = useMemo(() => {
    if (filter === 'all') {
      return records;
    }

    const now = new Date();
    let interval: { start: Date, end: Date };

    switch (filter) {
      case 'day':
        interval = { start: startOfDay(now), end: endOfDay(now) };
        break;
      case 'week':
        // Set Monday as the start of the week
        interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        break;
      case 'month':
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
        break;
      case 'quarter':
        interval = { start: startOfQuarter(now), end: endOfQuarter(now) };
        break;
      case 'year':
        interval = { start: startOfYear(now), end: endOfYear(now) };
        break;
      default:
        return records;
    }

    return records.filter(record => isWithinInterval(new Date(record.timestamp), interval));
  }, [records, filter]);

  if (isLoading) {
      return <div className="flex items-center justify-center h-full">Memuat riwayat transaksi...</div>
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-headline text-3xl font-bold">Riwayat Transaksi</h1>
        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <Label htmlFor="filter-select" className="sr-only">Filter berdasarkan periode</Label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger id="filter-select" className="w-full">
              <SelectValue placeholder="Pilih periode..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Transaksi</SelectItem>
              <SelectItem value="day">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="quarter">Triwulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua Transaksi</CardTitle>
          <CardDescription>Mencatat semua aktivitas barang masuk dan keluar dari inventaris.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
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
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">{record.id}</TableCell>
                    <TableCell>
                      <Badge variant={record.type === 'in' ? 'secondary' : 'default'}>
                        {record.type === 'in' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell className="text-center">{record.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
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
              <h3 className="text-xl font-semibold text-muted-foreground">Tidak Ada Transaksi</h3>
              <p className="text-muted-foreground">Tidak ada data transaksi yang ditemukan untuk periode yang dipilih.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
