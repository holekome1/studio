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

export interface Transaction {
  id: string;
  partId: string;
  partName: string;
  quantityChange: number;
  type: 'in' | 'out';
  timestamp: number;
}
