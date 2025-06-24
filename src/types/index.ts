export interface Part {
  id: string;
  name: string;
  quantity: number;
  price: number;
  storageLocation: string;
  category: PartCategory;
  minStock: number;
}

export const partCategories = [
  "Engine Parts",
  "Electrical Components",
  "Body & Frame",
  "Wheels & Tires",
  "Braking System",
  "Suspension",
  "Accessories",
  "Fluids & Chemicals",
  "Other",
] as const;

export type PartCategory = (typeof partCategories)[number];

export interface TransactionItem {
  partId: string;
  partName: string;
  quantity: number;
  price: number; // Price at the time of transaction
}

export interface TransactionRecord {
  id: string; // e.g., 'TXN-20240715103000'
  type: 'in' | 'out';
  items: TransactionItem[];
  timestamp: number;
  totalAmount: number;
  notes?: string;
}
