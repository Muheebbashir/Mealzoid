import { BiLoaderAlt } from "react-icons/bi";
import { useFetchRestaurant } from "../hooks/useFetchRestaurant";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import { useState, useEffect } from "react";
import type { Restaurant as RestaurantType } from "../types/restaurant.types";
import MenuItemsList from "../components/MenuItemsList";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import toast from "react-hot-toast";
import { getSocket } from "../lib/socket";
import { unlockAudio, playNotificationSound } from "../utils/sound";
import { useQueryClient } from "@tanstack/react-query";

type SellerTab = "menu" | "add-item" | "orders";

const Restaurant = () => {
  const { restaurant: fetchedRestaurant, isLoading } = useFetchRestaurant();
  const [localRestaurant, setLocalRestaurant] = useState<RestaurantType | null>(null);
  const [tab, setTab] = useState<SellerTab>("menu");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const queryClient = useQueryClient();

  const restaurant = localRestaurant || fetchedRestaurant || null;

  const notificationPermission = typeof window !== "undefined" && "Notification" in window 
    ? Notification.permission 
    : "denied";

  const requestNotificationPermission = async () => {
    await unlockAudio();
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPermissionGranted(true);
        toast.success("Notifications enabled!");
      }
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewOrder = () => {
      playNotificationSound();
      setNewOrderAlert(true);
      setTab("orders");
      queryClient.invalidateQueries({ queryKey: ["restaurantOrders"] });
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🛎️ New Order!", {
          body: "A customer just placed an order. Tap to view.",
          icon: "/logo1.png",
        });
      }
    };

    socket.on("order:new", handleNewOrder);
    return () => { socket.off("order:new", handleNewOrder); };
  }, [queryClient]);

  const handleUpdate = (updated: RestaurantType) => {
    setLocalRestaurant(updated);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant />;
  }

     return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      {/* Verification pending banner */}
      {!restaurant.isVerified && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
          <span className="text-amber-500 text-xl mt-0.5">⏳</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Verification Pending</p>
            <p className="text-xs text-amber-600 mt-0.5">Your restaurant is under review by our team. You can't go online until it's verified.</p>
          </div>
        </div>
      )}

      {/* New order alert banner */}
      {newOrderAlert && (
        <div className="rounded-xl bg-green-50 border border-green-300 px-4 py-3 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-green-600 text-2xl">🛎️</span>
            <div>
              <p className="font-semibold text-green-800 text-sm">New Order Received!</p>
              <p className="text-xs text-green-600 mt-0.5">A customer just placed an order. Check the Orders tab.</p>
            </div>
          </div>
          <button
            onClick={() => { setNewOrderAlert(false); setTab("orders"); }}
            className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
          >
            View
          </button>
        </div>
      )}

      {notificationPermission !== "granted" && !permissionGranted && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-yellow-800">Enable notifications</p>
              <p className="text-sm text-yellow-700">Get notified when new orders arrive</p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 sm:w-auto"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      <RestaurantProfile 
        restaurant={restaurant}
        isSeller={true} 
        onUpdate={handleUpdate} 
      />
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b">
          {[
            { key: "menu", label: "Menu", fullLabel: "Menu Items" },
            { key: "add-item", label: "Add", fullLabel: "Add Items" },
            { key: "orders", label: "Orders", fullLabel: "Orders" }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as SellerTab); if (t.key === "orders") setNewOrderAlert(false); }}
              className={`relative flex-1 px-2 py-3 text-sm font-medium transition sm:px-4 sm:text-base ${
                tab === t.key
                  ? "border-b-2 border-[#E23744] text-[#E23744]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="sm:hidden">{t.label}</span>
              <span className="hidden sm:inline">{t.fullLabel}</span>
              {t.key === "orders" && newOrderAlert && (
                <span className="ml-1.5 inline-flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "menu" && <MenuItemsList restaurantId={restaurant._id} />}
          {tab === "add-item" && <AddMenuItem />}
          {tab === "orders" && <RestaurantOrders restaurantId={restaurant._id} />}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;