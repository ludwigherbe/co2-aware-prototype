// src/types.ts
// Definiert die TypeScript-Typen für unsere Datenstrukturen.

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
  detailImages: string[];
  inStock: boolean;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}