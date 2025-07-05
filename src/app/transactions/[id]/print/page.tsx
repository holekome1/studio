
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import type { TransactionRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer } from 'lucide-react';

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
        dateStyle: 'medium',
        timeStyle: 'medium'
    })
}


export default function PrintInvoicePage() {
  const { id } = useParams();
  const [record, setRecord] = useState<TransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const transactionId = Array.isArray(id) ? id[0] : id;
    if (!transactionId || typeof window === 'undefined') {
        setIsLoading(false);
        return;
    }

    try {
        const storedTransactions = localStorage.getItem('inventory_transactions');
        if (storedTransactions) {
            const transactions: TransactionRecord[] = JSON.parse(storedTransactions);
            const foundRecord = transactions.find(t => t.id === transactionId);
            setRecord(foundRecord || null);
        } else {
            setRecord(null);
        }
    } catch (error) {
        console.error("Error fetching transaction for print:", error);
        setRecord(null);
    } finally {
        setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (record) {
      setTimeout(() => window.print(), 500);
    }
  }, [record]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Memuat data...</div>
  }

  if (!record) {
    return <div className="flex items-center justify-center min-h-screen">Transaksi tidak ditemukan.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print-receipt-wrapper">
        <div className="max-w-md mx-auto bg-white shadow-lg">
             <div className="printable-area p-6 text-sm">
                <header className="text-center mb-6">
                    <Image src="/logo.png" alt="Company Logo" width={56} height={56} className="mx-auto mb-2" />
                    <h1 className="text-xl font-bold text-gray-800">GUDANG MAJU SEJAHTRA</h1>
                    <p className="text-gray-500">Jl. Otomotif Raya No. 123, Jakarta</p>
                </header>
                <Separator className="my-4"/>
                <div className="flex justify-between text-xs text-gray-600 mb-4">
                    <div>
                        <p><strong>No. Transaksi:</strong></p>
                        <p>{record.id}</p>
                    </div>
                     <div className="text-right">
                        <p><strong>Tanggal:</strong></p>
                        <p>{formatDate(record.timestamp)}</p>
                    </div>
                </div>
                <Separator className="my-4"/>
                <h2 className="font-bold text-center mb-2 uppercase">
                    STRUK TRANSAKSI {record.type === 'in' ? 'MASUK' : 'KELUAR'}
                </h2>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b-2 border-dashed border-gray-400">
                            <th className="text-left py-1">Item</th>
                            <th className="text-center py-1">Jml</th>
                            <th className="text-right py-1">Harga</th>
                            <th className="text-right py-1">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {record.items.map((item, index) => (
                            <tr key={`${item.partId}-${index}`} className="border-b border-dashed border-gray-300">
                                <td className="py-1.5">{item.partName}</td>
                                <td className="text-center py-1.5">{item.quantity}</td>
                                <td className="text-right py-1.5">{formatRupiah(item.price)}</td>
                                <td className="text-right py-1.5">{formatRupiah(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Separator className="my-4"/>
                 <div className="flex justify-end text-sm">
                    <div className="w-1/2">
                        <div className="flex justify-between font-bold">
                            <span>TOTAL</span>
                            <span>{formatRupiah(record.totalAmount)}</span>
                        </div>
                    </div>
                </div>
                 {record.notes && (
                    <>
                        <Separator className="my-4"/>
                        <div className="text-xs text-gray-600">
                           <p><strong>Catatan:</strong> {record.notes}</p>
                        </div>
                    </>
                 )}
                <Separator className="my-4"/>
                <footer className="text-center text-xs text-gray-500 mt-6">
                    <p>Terima kasih atas kunjungan Anda!</p>
                    <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
                </footer>
            </div>
        </div>

        <div className="max-w-md mx-auto mt-4 text-center no-print">
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4"/>
                Cetak Ulang
            </Button>
        </div>
    </div>
  );
}
