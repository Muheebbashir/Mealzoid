import { useEffect } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useRestaurantOrders, useUpdateOrderStatus } from "../hooks/useOrder";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../lib/socket";
import toast from "react-hot-toast";

interface Props {
  restaurantId: string;
}

const RestaurantOrders = ({ restaurantId }: Props) => {
  const queryClient = useQueryClient();
  const { orders, isLoading } = useRestaurantOrders(restaurantId);

  const { updateStatus } = useUpdateOrderStatus();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("order:rider_assigned", (payload: { _id?: string; status?: string }) => {
      if (payload.status === "delivered") {
        toast.success("Order delivered!");
      } else {
        toast("Rider has been assigned to an order");
      }
      queryClient.invalidateQueries({ queryKey: ["restaurantOrders"] });
    });

    return () => {
      socket.off("order:rider_assigned");
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
  switch (status) {
    case "placed": return "bg-blue-100 text-blue-700";
    case "accepted": return "bg-yellow-100 text-yellow-700";
    case "preparing": return "bg-orange-100 text-orange-700";
    case "ready for pickup": return "bg-purple-100 text-purple-700";
    case "out for delivery": return "bg-indigo-100 text-indigo-700";
    case "delivered": return "bg-green-100 text-green-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

  if (orders.length === 0) {
    return <div className="py-12 text-center text-gray-500">No orders yet</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <div
          key={order._id}
          className="rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">
              Order #{order._id.slice(-6)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>

          <div className="mb-3 space-y-2">
            {order.item.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="mb-2 flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="text-[#E23744]">₹{order.totalAmount}</span>
            </div>
            <p className="mb-2 text-xs text-gray-600">
              📍 {order.deliveryAddress.formattedAddress}
            </p>
            <p className="text-xs text-gray-600">
              📞 {order.deliveryAddress.mobile}
            </p>
          </div>

          {order.status === "placed" && (
            <button
              onClick={() =>
                updateStatus({ orderId: order._id, status: "accepted" })
              }
              className="mt-3 w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Accept Order
            </button>
          )}

          {order.status === "accepted" && (
            <button
              onClick={() =>
                updateStatus({ orderId: order._id, status: "preparing" })
              }
              className="mt-3 w-full rounded-lg bg-orange-600 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Start Preparing
            </button>
          )}

          {order.status === "preparing" && (
            <button
              onClick={() =>
                updateStatus({ orderId: order._id, status: "ready for pickup" })
              }
              className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Ready for Pickup
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default RestaurantOrders;
