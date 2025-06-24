
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Part } from "@/types";
import { partCategories } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter."),
  quantity: z.coerce.number().int().min(0, "Jumlah tidak boleh negatif."),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif."),
  storageLocation: z.string().min(1, "Lokasi penyimpanan harus diisi."),
  category: z.enum(partCategories),
  minStock: z.coerce.number().int().min(0, "Jumlah minimal tidak boleh negatif."),
});

export type PartFormValues = z.infer<typeof formSchema>;

interface PartFormProps {
  onSubmit: (values: PartFormValues) => void;
  onCancel: () => void;
  initialData?: Partial<Part>;
  isEditing?: boolean;
}

export function PartForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: PartFormProps) {
  const form = useForm<PartFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      quantity: initialData?.quantity || 0,
      price: initialData?.price || 0,
      storageLocation: initialData?.storageLocation || "",
      category: initialData?.category || partCategories[0],
      minStock: initialData?.minStock || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Suku Cadang</FormLabel>
              <FormControl>
                <Input placeholder="cth., Busi NGK CR7HSA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="cth., 10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok Minimum</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="cth., 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga (Rp)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="cth., 50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="storageLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi Penyimpanan</FormLabel>
              <FormControl>
                <Input placeholder="cth., Rak A-3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {partCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" variant="default">
            {isEditing ? "Simpan Perubahan" : "Tambah Suku Cadang"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
