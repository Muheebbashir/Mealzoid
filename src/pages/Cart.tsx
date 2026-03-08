import { useMyCart, useIncrementCartItem, useDecrementCartItem, useClearCart } from "../hooks/useCart";
import { BiLoaderAlt, BiTrash } from "react-icons/bi";
import { Link } from "react-router-dom";
import type { MenuItem } from "../types/menuItem.types";
import type { Restaurant } from "../types/restaurant.types";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, subTotal, isLoading } = useMyCart();
  const { incrementItem } = useIncrementCartItem();
  const { decrementItem } = useDecrementCartItem();
  const { clearCart } = useClearCart();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800">Your cart is empty</p>
          <Link to="/" className="mt-4 inline-block text-[#E23744] hover:underline">
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = cartItems[0].restaurantId as Restaurant;
  const isRestaurantOpen = restaurant.isOpen;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <button
            onClick={() => {
              if (confirm("Clear all items from cart?")) {
                clearCart();
              }
            }}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Clear Cart
          </button>
        </div>

        {/* Restaurant Info */}
        <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Order from</p>
              <p className="text-lg font-semibold text-gray-900">{restaurant.name}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isRestaurantOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isRestaurantOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          {cartItems.map((cartItem) => {
            const item = cartItem.itemId as MenuItem;
            return (
              <div
                key={cartItem._id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                {/* Top row: image + name/price + trash */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${item.name} from cart?`)) {
                        decrementItem(item._id);
                      }
                    }}
                    className="shrink-0 text-red-500 hover:text-red-600"
                  >
                    <BiTrash size={20} />
                  </button>
                </div>
                {/* Bottom row: qty controls + total */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrementItem(item._id)}
                      className="rounded bg-gray-200 px-2.5 py-1 text-sm font-semibold hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{cartItem.quantity}</span>
                    <button
                      onClick={() => incrementItem(item._id)}
                      className="rounded bg-gray-200 px-2.5 py-1 text-sm font-semibold hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">
                    ₹{(item.price * cartItem.quantity).toFixed(0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total & Checkout */}
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-lg">
            <span className="font-semibold">Subtotal</span>
            <span className="font-bold text-[#E23744]">₹{subTotal.toFixed(0)}</span>
          </div>
          
          {isRestaurantOpen ? (
            <button className="w-full rounded-lg bg-[#E23744] py-3 font-semibold text-white transition hover:bg-[#c0303c]"
            onClick={()=>navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          ) : (
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="font-semibold text-red-700">Restaurant is currently closed</p>
              <p className="mt-1 text-sm text-red-600">
                You can checkout when the restaurant opens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;