import { useEffect } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useMyOrders } from "../hooks/useOrder";
import { getSocket } from "../lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const MyOrders = () => {
  const queryClient = useQueryClient();
  const { orders, isLoading } = useMyOrders();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("order:updated", (payload) => {
      toast(`Order #${payload.orderId.slice(-6)} status: ${payload.status}`);
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    });

    return () => {
      socket.off("order:updated");
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-blue-100 text-blue-700";
      case "accepted": return "bg-yellow-100 text-yellow-700";
      case "preparing": return "bg-orange-100 text-orange-700";
      case "ready_for_rider": return "bg-purple-100 text-purple-700";
      case "out for delivery": return "bg-indigo-100 text-indigo-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

        {orders.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">No orders yet</p>
            <Link to="/" className="mt-4 inline-block text-[#E23744] hover:underline">
              Start ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
            <div key={order._id} onClick={() => navigate(`/orders/${order._id}`)} className="rounded-lg border bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow sm:p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{order.restaurantName}</h3>
                    <p className="text-sm text-gray-500">Order #{order._id.slice(-6)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mb-4 space-y-2">
                  {order.item.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} x{item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{order.subTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>₹{order.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee</span>
                    <span>₹{order.platformFee}</span>
                  </div>
                  <div className="mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[#E23744]">₹{order.totalAmount}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-600">Delivery Address</p>
                  <p className="text-sm font-medium text-gray-900">{order.deliveryAddress.formattedAddress}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;