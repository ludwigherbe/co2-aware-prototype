// co2-aware-frontend/src/services/apiServices.ts
import type { Cart, Product } from '../types';

// Wir definieren die gesamte API-Antwort als Typ für Typsicherheit
export interface PaginatedProductsResponse {
  results: Product[];
  info: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
  };
  next?: { page: number; limit: number };
  previous?: { page: number; limit: number };
}

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = ''; // gleich-origin

/**
 * Ruft eine paginierte und/oder gefilterte Produktliste vom Backend ab.
 * @param page Die abzurufende Seitenzahl.
 * @param limit Die Anzahl der Produkte pro Seite.
 * @param search Der Suchbegriff (optional).
 */
export const fetchProducts = async (page: number, limit: number = 10, search: string = ''): Promise<PaginatedProductsResponse> => {
  // KORREKTUR: URLSearchParams für saubere Query-Parameter verwenden
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Fehler beim Abrufen der Produkte vom Server.');
  }

  const data: PaginatedProductsResponse = await response.json();
  return data;
};

/**
 * Ruft ein einzelnes Produkt anhand seiner ID ab.
 * @param id Die ID des Produkts.
 * @returns Ein Promise, das das Produkt-Objekt auflöst.
 */
export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!response.ok) {
    throw new Error('Fehler beim Abrufen des Produkts.');
  }
  return response.json();
};

/**
 * Ruft ähnliche Produkte für eine gegebene Produkt-ID ab.
 * @param id Die ID des Hauptprodukts.
 * @returns Ein Promise, das ein Array von ähnlichen Produkten auflöst.
 */
export const fetchRelatedProducts = async (id: string): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}/related`);
  if (!response.ok) {
    throw new Error('Fehler beim Abrufen ähnlicher Produkte.');
  }
  return response.json();
};

export const getCart = async (): Promise<Cart> => {
  const response = await fetch(`${API_BASE_URL}/api/cart`);
  if (!response.ok) throw new Error('Warenkorb konnte nicht geladen werden.');
  return response.json();
};

export const addItemToCart = async (productId: number, quantity: number): Promise<Cart> => {
  const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) throw new Error('Produkt konnte nicht hinzugefügt werden.');
  return response.json();
};

export const updateCartItem = async (productId: number, quantity: number): Promise<Cart> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Menge konnte nicht aktualisiert werden.');
    return response.json();
};

export const removeCartItem = async (productId: number): Promise<Cart> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Produkt konnte nicht entfernt werden.');
    return response.json();
};

export const clearCart = async (): Promise<Cart> => {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Warenkorb konnte nicht geleert werden.');
  return response.json();
};