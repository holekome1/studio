export interface Part {
  id: string;
  name: string;
  quantity: number;
  price: number;
  storageLocation: string;
  category: PartCategory;
}

export const पार्टCategories = [
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

export type PartCategory = (typeof पार्टCategories)[number];
