import { useParams, useNavigate } from "react-router-dom";
import { BiLoaderAlt, BiArrowBack } from "react-icons/bi";
import { useSingleOrder } from "../hooks/useOrder";
import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DeliveryMap from "../components/DeliveryMap";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { order, isLoading } = useSingleOrder(orderId);
  const [riderPosition, setRiderPosition] = useState<[number, number] | null>(
    null,
  );

  useEffect(() => {
    if (!orderId) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let registered = false;

    const setup = () => {
      const socket = getSocket();
      if (!socket) return;

      // Stop polling — socket is ready
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      registered = true;

      socket.on("order:updated", (payload) => {
        if (payload.orderId === orderId) {
          toast(`Order status: ${payload.status}`);
          queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        }
      });

      // Join the order-specific room to receive live rider location
      socket.emit("order:track", { orderId });

      socket.on(
        "order:rider_assigned",
        (payload: { _id?: string; status?: string }) => {
          const affectedId = payload._id;
          if (!affectedId || affectedId !== orderId) return;
          if (payload.status === "delivered") {
            toast.success("Your order has been delivered! 🎉");
          } else {
            toast.success("Rider assigned — your order is on the way 🚴");
          }
          queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        },
      );

      socket.on(
        "rider:location",
        (payload: { orderId: string; lat: number; lng: number }) => {
          if (payload.orderId !== orderId) return;
          setRiderPosition([payload.lat, payload.lng]);
        },
      );
    };

    // Try immediately; if socket isn't ready yet, retry every 300 ms
    setup();
    if (!registered) {
      intervalId = setInterval(setup, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      const socket = getSocket();
      if (!socket) return;
      socket.off("order:updated");
      socket.off("order:rider_assigned");
      socket.off("rider:location");
    };
  }, [orderId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800">Order not found</p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 text-[#E23744] hover:underline"
          >
            Go back to orders
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: "placed", label: "Placed", icon: "📝" },
    { key: "accepted", label: "Accepted", icon: "✅" },
    { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
    { key: "ready for pickup", label: "Ready", icon: "📦" },
    { key: "out for delivery", label: "On the way", icon: "🚗" },
    { key: "delivered", label: "Delivered", icon: "🎉" },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === order.status,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-100 text-blue-700";
      case "accepted":
        return "bg-yellow-100 text-yellow-700";
      case "preparing":
        return "bg-orange-100 text-orange-700";
      case "ready for pickup":
        return "bg-purple-100 text-purple-700";
      case "out for delivery":
        return "bg-indigo-100 text-indigo-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const currentStatusLabel =
    statusSteps[currentStepIndex]?.label || order.status;
  const currentStatusIcon = statusSteps[currentStepIndex]?.icon || "📦";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:py-6">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="mb-4 flex items-center gap-2 text-gray-700 transition hover:text-[#E23744]"
        >
          <BiArrowBack className="h-5 w-5" />
          <span className="font-medium">Back to Orders</span>
        </button>

        {/* Order Header */}
        <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Order #{order._id.slice(-6)}
              </h1>
              <p className="text-xs text-gray-500 sm:text-sm">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentStatusIcon}</span>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${getStatusColor(
                  order.status,
                )}`}
              >
                {currentStatusLabel}
              </span>
            </div>
          </div>

          {/* ✅ Responsive Timeline */}
          {order.status !== "cancelled" && (
            <div className="mt-6">
              {/* Desktop/Tablet Timeline (horizontal) */}
              <div className="hidden md:block">
                <div className="relative flex items-center justify-between">
                  {/* Background Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />

                  {/* Active Line with animation */}
                  <div
                    className="absolute top-5 left-0 h-1 bg-[#E23744] transition-all duration-700 ease-in-out"
                    style={{
                      width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />

                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className="relative z-10 flex flex-1 flex-col items-center"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-500 ${
                            isCompleted
                              ? "border-[#E23744] bg-[#E23744] text-white scale-110"
                              : "border-gray-300 bg-white text-gray-400"
                          } ${isCurrent ? "ring-4 ring-[#E23744]/20" : ""}`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>
                        <p
                          className={`mt-2 text-center text-xs font-medium ${
                            isCompleted ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Timeline (vertical) */}
              <div className="block md:hidden">
                <div className="relative space-y-4">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className="relative flex items-center gap-4"
                      >
                        {/* Vertical Line */}
                        {index < statusSteps.length - 1 && (
                          <div className="absolute left-5 top-10 h-full w-0.5 bg-gray-200">
                            {isCompleted && (
                              <div className="h-full w-full bg-[#E23744] transition-all duration-500" />
                            )}
                          </div>
                        )}

                        {/* Circle */}
                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-500 ${
                            isCompleted
                              ? "border-[#E23744] bg-[#E23744] text-white"
                              : "border-gray-300 bg-white text-gray-400"
                          } ${isCurrent ? "ring-4 ring-[#E23744]/20" : ""}`}
                        >
                          {isCompleted ? "✓" : index + 1}
                        </div>

                        {/* Label */}
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isCompleted ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {step.icon} {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-[#E23744]">
                              Current status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900 sm:mb-3 sm:text-lg">
            Restaurant
          </h2>
          <p className="text-sm text-gray-700 sm:text-base">
            {order.restaurantName}
          </p>
        </div>

        {/* Order Items */}
        <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
            Order Items
          </h2>
          <div className="space-y-3">
            {order.item.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 sm:text-base">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 sm:text-base">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Details */}
        <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
            Bill Details
          </h2>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item Total</span>
              <span className="font-medium">₹{order.subTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium">₹{order.platformFee}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="font-semibold text-gray-900">Total Paid</span>
                <span className="font-bold text-[#E23744]">
                  ₹{order.totalAmount.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rider Info + Live Map */}
        {(order.status === "out for delivery" ||
          order.status === "delivered") &&
          order.riderPhone && (
            <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
              <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                🚴 Rider Details
              </h2>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                {order.riderPhone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-500 w-16">
                      Phone
                    </span>
                    <a
                      href={`tel:${order.riderPhone}`}
                      className="text-[#E23744] underline"
                    >
                      {order.riderPhone}
                    </a>
                  </div>
                )}
              </div>
              {/* Live tracking map */}
              {/* Live tracking map — only while out for delivery */}
              {order.status === "out for delivery" && (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 bg-gray-50 border-b">
                    {riderPosition
                      ? "🟢 Live Tracking"
                      : "🗺️ Delivery Location"}
                  </p>
                  <DeliveryMap
                    riderPosition={riderPosition}
                    deliveryPosition={[
                      order.deliveryAddress.latitude,
                      order.deliveryAddress.longitude,
                    ]}
                    riderLabel="🚴 Your Rider"
                  />
                </div>
              )}
            </div>
          )}

        {/* Delivery Address */}
        <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900 sm:mb-3 sm:text-lg">
            Delivery Address
          </h2>
          <p className="text-sm text-gray-700 sm:text-base">
            {order.deliveryAddress.formattedAddress}
          </p>
          <p className="mt-2 text-xs text-gray-600 sm:text-sm">
            Phone: {order.deliveryAddress.mobile}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
