export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
