import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiLoaderAlt, BiPlus } from "react-icons/bi";
import { useMyCart } from "../hooks/useCart";
import { useMyAddresses } from "../hooks/useAddress";
import { useCreateOrder, useRazorpayPayment } from "../hooks/useOrder";
import toast from "react-hot-toast";
import type { MenuItem } from "../types/menuItem.types";
import type { Restaurant } from "../types/restaurant.types";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subTotal, isLoading: cartLoading } = useMyCart();
  const { addresses, isLoading: addressLoading } = useMyAddresses();
  const { createOrder, isLoading: creatingOrder } = useCreateOrder();
  const { initializePayment } = useRazorpayPayment();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  if (cartLoading || addressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate("/");
    return null;
  }

  const restaurant = cartItems[0].restaurantId as Restaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const totalAmount = subTotal + deliveryFee + platformFee;

  const handlePlaceOrder = () => {
  if (!selectedAddressId) {
    toast.error("Please select a delivery address");
    return;
  }

  createOrder(
    { addressId: selectedAddressId },
    {
      onSuccess: (data) => {
        initializePayment(data.orderId, data.amount, () => {
          navigate("/orders");
        });
      },
    }
  );
};

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-28 pt-6 lg:pb-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Address & Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
                <button
                  onClick={() => navigate("/address")}
                  className="flex items-center gap-1 text-sm font-medium text-[#E23744] hover:underline"
                >
                  <BiPlus size={18} />
                  Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No saved addresses</p>
                  <button
                    onClick={() => navigate("/address")}
                    className="mt-3 text-[#E23744] hover:underline"
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddressId(address._id)}
                      className={`cursor-pointer rounded-lg border p-4 transition ${
                        selectedAddressId === address._id
                          ? "border-[#E23744] bg-red-50 ring-2 ring-[#E23744]/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${
                            selectedAddressId === address._id
                              ? "border-[#E23744] bg-[#E23744]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddressId === address._id && (
                            <div className="flex h-full items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{address.formattedAddress}</p>
                          <p className="mt-1 text-sm text-gray-600">Mobile: {address.mobile}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Order from {restaurant.name}
              </h2>
              <div className="space-y-3">
                {cartItems.map((cartItem) => {
                  const item = cartItem.itemId as MenuItem;
                  return (
                    <div key={cartItem._id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Qty: {cartItem.quantity}</p>
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * cartItem.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Bill Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Bill Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Total</span>
                  <span className="font-medium text-gray-900">₹{subTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-gray-900">₹{deliveryFee}</span>
                </div>
                {deliveryFee > 0 && subTotal >= 200 && (
                  <p className="text-xs text-gray-500">
                    Add items worth ₹{(250 - subTotal).toFixed(0)} more for free delivery
                  </p>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">₹{platformFee}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-gray-900">To Pay</span>
                    <span className="font-bold text-[#E23744]">₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || creatingOrder}
                className="mt-6 w-full rounded-lg bg-[#E23744] py-3 font-semibold text-white transition hover:bg-[#c0303c] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingOrder ? "Processing..." : "Place Order & Pay"}
              </button>

              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white px-4 py-3 shadow-lg lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-[#E23744]">₹{totalAmount.toFixed(0)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={!selectedAddressId || creatingOrder}
            className="flex-1 rounded-lg bg-[#E23744] py-3 font-semibold text-white transition hover:bg-[#c0303c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingOrder ? "Processing..." : "Place Order & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;