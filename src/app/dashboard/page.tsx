
"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import type { TransactionRecord } from "@/types";
import { Package, PackagePlus } from "lucide-react";

interface ChartData {
  name: string;
  total: number;
}

const outgoingChartConfig = {
  total: {
    label: "Jumlah Keluar",
    color: "hsl(var(--chart-1))",
  },
};

const incomingChartConfig = {
  total: {
    label: "Jumlah Masuk",
    color: "hsl(var(--chart-2))",
  },
};

export default function DashboardPage() {
  const [transactionRecords, setTransactionRecords] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    const storedTransactions = localStorage.getItem("motorparts_transaction_records");
    if (storedTransactions) {
      setTransactionRecords(JSON.parse(storedTransactions));
    }
  }, []);

  const outgoingItemsData = useMemo<ChartData[]>(() => {
    const itemCounts = new Map<string, number>();
    transactionRecords
      .filter((t) => t.type === 'out')
      .forEach((t) => {
        t.items.forEach(item => {
          const currentCount = itemCounts.get(item.partName) || 0;
          itemCounts.set(item.partName, currentCount + item.quantity);
        })
      });
    return Array.from(itemCounts.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [transactionRecords]);

  const incomingItemsData = useMemo<ChartData[]>(() => {
    const itemCounts = new Map<string, number>();
    transactionRecords
      .filter((t) => t.type === 'in')
      .forEach((t) => {
        t.items.forEach(item => {
          const currentCount = itemCounts.get(item.partName) || 0;
          itemCounts.set(item.partName, currentCount + item.quantity);
        })
      });
    return Array.from(itemCounts.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [transactionRecords]);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Dasbor Statistik</h1>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Barang Sering Keluar</CardTitle>
            <CardDescription>10 suku cadang yang paling sering keluar dari gudang.</CardDescription>
          </CardHeader>
          <CardContent>
            {outgoingItemsData.length > 0 ? (
              <ChartContainer config={outgoingChartConfig} className="min-h-[200px] w-full h-[450px]">
                  <BarChart data={outgoingItemsData} margin={{ top: 5, right: 20, left: -10, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis allowDecimals={false} stroke="hsl(var(--border))" tick={{fill: "hsl(var(--foreground))"}}/>
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
            ) : (
               <div className="flex flex-col items-center justify-center p-10 text-center h-[400px]">
                  <Package className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-muted-foreground">Belum Ada Data Transaksi Keluar</h3>
                  <p className="text-muted-foreground">Data akan muncul di sini setelah ada barang yang keluar.</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barang Sering Masuk</CardTitle>
            <CardDescription>10 suku cadang yang paling sering masuk ke gudang.</CardDescription>
          </CardHeader>
          <CardContent>
            {incomingItemsData.length > 0 ? (
              <ChartContainer config={incomingChartConfig} className="min-h-[200px] w-full h-[450px]">
                  <BarChart data={incomingItemsData} margin={{ top: 5, right: 20, left: -10, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis allowDecimals={false} stroke="hsl(var(--border))" tick={{fill: "hsl(var(--foreground))"}}/>
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
            ) : (
               <div className="flex flex-col items-center justify-center p-10 text-center h-[400px]">
                  <PackagePlus className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-muted-foreground">Belum Ada Data Transaksi Masuk</h3>
                  <p className="text-muted-foreground">Data akan muncul di sini setelah ada barang yang masuk.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
