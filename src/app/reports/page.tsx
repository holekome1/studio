
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfQuarter, endOfQuarter,
  startOfYear, endOfYear, isWithinInterval
} from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { TransactionRecord } from "@/types";
import { ArrowDownCircle, ArrowUpCircle, BookOpen, Printer, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalMasuk: number;
  totalKeluar: number;
  totalValueMasuk: number;
  totalValueKeluar: number;
  totalItemsMasuk: number;
  totalItemsKeluar: number;
  topItemsMasuk: { name: string; quantity: number }[];
  topItemsKeluar: { name: string; quantity: number }[];
}

const filterOptions = [
    { value: 'day', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'quarter', label: 'Triwulan Ini' },
    { value: 'year', label: 'Tahun Ini' },
];


export default function ReportsPage() {
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('month');
  const [printDate, setPrintDate] = useState('');

  useEffect(() => {
    const storedRecords = getStoredTransactions();
    setRecords(storedRecords);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPrintDate(new Date().toLocaleDateString('id-ID', {
          day: '2-digit', month: 'long', year: 'numeric'
      }));
    }
  }, []);

  const reportData = useMemo<ReportData>(() => {
    const now = new Date();
    let interval: { start: Date, end: Date };
    const selectedOption = filterOptions.find(opt => opt.value === filter) || filterOptions[2];

    switch (filter) {
      case 'day': interval = { start: startOfDay(now), end: endOfDay(now) }; break;
      case 'week': interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }; break;
      case 'month': interval = { start: startOfMonth(now), end: endOfMonth(now) }; break;
      case 'quarter': interval = { start: startOfQuarter(now), end: endOfQuarter(now) }; break;
      case 'year': interval = { start: startOfYear(now), end: endOfYear(now) }; break;
      default: interval = { start: startOfMonth(now), end: endOfMonth(now) };
    }
    
    const filteredRecords = records.filter(record => isWithinInterval(new Date(record.timestamp), interval));
    const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const data: Omit<ReportData, 'period' | 'startDate' | 'endDate'> = {
        totalMasuk: 0,
        totalKeluar: 0,
        totalValueMasuk: 0,
        totalValueKeluar: 0,
        totalItemsMasuk: 0,
        totalItemsKeluar: 0,
        topItemsMasuk: [],
        topItemsKeluar: [],
    };
    
    const itemsIn = new Map<string, number>();
    const itemsOut = new Map<string, number>();

    for (const record of filteredRecords) {
        if (record.type === 'in') {
            data.totalMasuk++;
            data.totalValueMasuk += record.totalAmount;
            record.items.forEach(item => {
                const currentQty = itemsIn.get(item.partName) || 0;
                itemsIn.set(item.partName, currentQty + item.quantity);
                data.totalItemsMasuk += item.quantity;
            });
        } else {
            data.totalKeluar++;
            data.totalValueKeluar += record.totalAmount;
             record.items.forEach(item => {
                const currentQty = itemsOut.get(item.partName) || 0;
                itemsOut.set(item.partName, currentQty + item.quantity);
                data.totalItemsKeluar += item.quantity;
            });
        }
    }

    data.topItemsMasuk = Array.from(itemsIn.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
        
    data.topItemsKeluar = Array.from(itemsOut.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);


    return { 
        ...data, 
        period: selectedOption.label,
        startDate: formatDate(interval.start),
        endDate: formatDate(interval.end),
    };
  }, [records, filter]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Memuat data laporan...</div>;
  }
  
  const StatCard = ({ title, value, icon: Icon, description, badgeValue, badgeVariant }: { title: string; value: string; icon: React.ElementType; description?: string, badgeValue?: string, badgeVariant?: "default" | "secondary" }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {badgeValue && <Badge variant={badgeVariant} className="mt-2">{badgeValue}</Badge>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 report-page">
      <div className="report-print-header">
        <h1>GUDANG MAJU SEJAHTRA</h1>
        <h2>Laporan Gabungan</h2>
        <p>Periode Laporan: {reportData.startDate} - {reportData.endDate}</p>
        <p>Tanggal Cetak: {printDate}</p>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center no-print">
        <h1 className="font-headline text-3xl font-bold">Laporan Gabungan</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <Label htmlFor="filter-select" className="sr-only">Filter berdasarkan periode</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger id="filter-select" className="w-full">
                <SelectValue placeholder="Pilih periode..." />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => window.print()} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Cetak Laporan
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="no-print">
            <CardTitle>Ringkasan Laporan - {reportData.period}</CardTitle>
            <CardDescription>Ringkasan aktivitas inventaris untuk periode yang dipilih.</CardDescription>
        </CardHeader>
        <CardContent>
            {records.length > 0 ? (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Pemasukan (Nilai)" value={formatRupiah(reportData.totalValueMasuk)} icon={TrendingUp} description={`${reportData.totalMasuk} transaksi masuk`} />
                        <StatCard title="Total Pengeluaran (Nilai)" value={formatRupiah(reportData.totalValueKeluar)} icon={TrendingDown} description={`${reportData.totalKeluar} transaksi keluar`} />
                        <StatCard title="Total Item Masuk" value={`${reportData.totalItemsMasuk}`} icon={ArrowUpCircle} description="Jumlah unit suku cadang" />
                        <StatCard title="Total Item Keluar" value={`${reportData.totalItemsKeluar}`} icon={ArrowDownCircle} description="Jumlah unit suku cadang" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ArrowUpCircle className="h-5 w-5 text-green-500"/> Top 5 Barang Masuk</CardTitle>
                                <CardDescription>Suku cadang yang paling sering ditambahkan ke gudang.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reportData.topItemsMasuk.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama Suku Cadang</TableHead>
                                                <TableHead className="text-right">Jumlah</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportData.topItemsMasuk.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada barang masuk pada periode ini.</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ArrowDownCircle className="h-5 w-5 text-red-500"/> Top 5 Barang Keluar</CardTitle>
                                <CardDescription>Suku cadang yang paling sering dikeluarkan dari gudang.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reportData.topItemsKeluar.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama Suku Cadang</TableHead>
                                                <TableHead className="text-right">Jumlah</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reportData.topItemsKeluar.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada barang keluar pada periode ini.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center p-10 text-center h-[400px]">
                  <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-muted-foreground">Belum Ada Data Laporan</h3>
                  <p className="text-muted-foreground">Data akan muncul di sini setelah ada transaksi yang tercatat.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
