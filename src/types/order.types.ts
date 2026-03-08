export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  distance: number;
  riderId?: string;
  riderAmount: number;
  riderName?: string;
  riderPhone?: number;
  item: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subTotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;
  addressId: string;
  deliveryAddress: {
    formattedAddress: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };
  status: "placed" | "accepted" | "preparing" | "ready for pickup" | "out for delivery" | "delivered" | "cancelled";
  paymentMethod: "razorpay";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}