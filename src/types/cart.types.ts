import type { MenuItem } from "./menuItem.types";
import type { Restaurant } from "./restaurant.types";

export interface CartItem {
  _id: string;
  userId: string;
  restaurantId: string | Restaurant;
  itemId: string | MenuItem;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartResponse {
  success: boolean;
  cartItems: CartItem[];
  subTotal: number;
  cartLength: number;
  cart: CartItem[];
}