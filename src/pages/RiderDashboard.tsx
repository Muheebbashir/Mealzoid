import { useEffect, useState } from "react";
import { BiLoaderAlt, BiPhone, BiIdCard, BiMapPin, BiPackage, BiCar, BiCheckCircle } from "react-icons/bi";
import { HiOutlineLogout } from "react-icons/hi";
import { useMyRiderProfile, useToggleRiderAvailability, useAcceptOrder, useCurrentOrder, useUpdateOrderStatus, useAvailableOrders } from "../hooks/useRider";
import { useUserLocation } from "../hooks/useLocation";
import { useLogout } from "../hooks/useLogout";
import { useAuthUser } from "../hooks/useProfile";
import { getSocket } from "../lib/socket";
import { unlockAudio } from "../utils/sound";
import CreateRiderProfile from "../components/CreateRiderProfile";
import DeliveryMap from "../components/DeliveryMap";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const RiderDashboard = () => {
  const queryClient = useQueryClient();
  const { profile, isLoading } = useMyRiderProfile();
  const { toggleAvailability, isLoading: toggling } = useToggleRiderAvailability();
  const { location } = useUserLocation();
  const { logout } = useLogout();
  const { user } = useAuthUser();
  const { acceptOrder: acceptOrderMutation, isLoading: accepting } = useAcceptOrder();
  const { currentOrder } = useCurrentOrder();
  const { updateStatus } = useUpdateOrderStatus();
  const { availableOrders: polledOrders } = useAvailableOrders(!!profile?.isAvailable);
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [riderPosition, setRiderPosition] = useState<[number, number] | null>(null);

  // Broadcast live GPS position to customer while on an active delivery
  useEffect(() => {
    if (!currentOrder) {
      setTimeout(() => setRiderPosition(null), 0);
      return;
    }

    let socket = getSocket();
    let watchId: number | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const startTracking = (sock: ReturnType<typeof getSocket>) => {
      if (!sock) return false;

      const emitLocation = ({ coords }: GeolocationPosition) => {
        const pos: [number, number] = [coords.latitude, coords.longitude];
        setRiderPosition(pos);
        sock.emit("rider:location", {
          orderId: currentOrder._id,
          lat: coords.latitude,
          lng: coords.longitude,
        });
      };

      // Emit once immediately so customer sees location right away
      navigator.geolocation.getCurrentPosition(
        emitLocation,
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );

      // Then keep streaming on every movement
      watchId = navigator.geolocation.watchPosition(
        emitLocation,
        (err) => console.warn("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );

      return true;
    };

    if (!startTracking(socket)) {
      // Socket not ready yet — poll until it is
      pollId = setInterval(() => {
        socket = getSocket();
        if (startTracking(socket) && pollId) {
          clearInterval(pollId);
          pollId = null;
        }
      }, 300);
    }

    return () => {
      if (pollId) clearInterval(pollId);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [currentOrder]);

  const visibleOrders = polledOrders.filter(o => !declinedIds.has(o.orderId));

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (profile?.isAvailable) {
      // Join the shared pool to receive order:available broadcasts
      socket.emit("rider:join_pool");
    } else {
      socket.emit("rider:leave_pool");
      // Clear stale order list so it doesn't show when offline
      queryClient.removeQueries({ queryKey: ["availableOrders"] });
      setTimeout(() => setDeclinedIds(new Set()), 0);
    }
  }, [profile?.isAvailable, queryClient]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  if (!profile) return <CreateRiderProfile />;

  const handleToggleAvailability = () => {
    if (currentOrder) { toast.error("Complete your current delivery before going offline."); return; }
    if (!location?.coords) { toast.error("Enable location access first."); return; }
    if (!profile.isVerified && !profile.isAvailable) { toast.error("Profile not verified yet."); return; }
    // Unlock audio on this user gesture so socket-triggered sounds work later
    if (!profile.isAvailable) unlockAudio();
    toggleAvailability({ isAvailable: !profile.isAvailable, latitude: location.coords.lat, longitude: location.coords.lon });
  };

  const handleLogout = () => {
    if (profile.isAvailable) {
      toggleAvailability(
        { isAvailable: false, latitude: location?.coords?.lat || 0, longitude: location?.coords?.lon || 0 },
        { onSuccess: () => logout() }
      );
    } else {
      logout();
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    if (currentOrder) return; // already on a delivery
    acceptOrderMutation(orderId, {
      onSuccess: () => {
        // Refresh profile so isAvailable flips to false, which triggers the
        // useEffect else-branch to clear the available-orders cache.
        queryClient.invalidateQueries({ queryKey: ["riderProfile"] });
        queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      },
    });
  };

  const handleDeclineOrder = (orderId: string) => {
    setDeclinedIds(prev => new Set(prev).add(orderId));
  };

  const handleMarkDelivered = () => {
    if (currentOrder?._id) updateStatus(currentOrder._id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img src={profile.picture} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#E23744]" />
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{user?.name || "Rider"}</p>
            <span className={`text-xs font-medium ${profile.isAvailable ? "text-green-600" : "text-gray-400"}`}>
              {profile.isAvailable ? "● Online" : "● Offline"}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition">
          <HiOutlineLogout className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="mx-auto max-w-lg px-4 py-5 space-y-4">

        {/* Verification banner */}
        {!profile.isVerified && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
            <span className="text-amber-500 text-xl mt-0.5">⏳</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Verification Pending</p>
              <p className="text-xs text-amber-600 mt-0.5">Your profile is under review. You can't go online until verified.</p>
            </div>
          </div>
        )}

        {/* Active delivery — can't go offline banner */}
        {currentOrder && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 flex items-start gap-3">
            <span className="text-indigo-500 text-xl mt-0.5">🚴</span>
            <div>
              <p className="font-semibold text-indigo-800 text-sm">Delivery in Progress</p>
              <p className="text-xs text-indigo-600 mt-0.5">You cannot change your status until you complete the current delivery.</p>
            </div>
          </div>
        )}

        {/* Online / Offline toggle card */}
        <div className="rounded-xl bg-white shadow-sm border px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`text-base font-bold mt-0.5 ${profile.isAvailable ? "text-green-600" : "text-gray-500"}`}>
              {profile.isAvailable ? "You're Online" : "You're Offline"}
            </p>
            {currentOrder && (
              <p className="text-xs text-indigo-500 mt-0.5">Locked during delivery</p>
            )}
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={toggling || !profile.isVerified || !!currentOrder}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              profile.isAvailable ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              profile.isAvailable ? "translate-x-7" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Available order cards */}
        {visibleOrders.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1">
              {visibleOrders.length} order{visibleOrders.length > 1 ? "s" : ""} waiting nearby
            </p>
            {visibleOrders.map((order) => (
              <div key={order.orderId} className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                {/* Accent stripe */}
                <div className="h-1 bg-[#E23744]" />
                <div className="px-4 pt-3 pb-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{order.restaurantName}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <BiMapPin className="h-3.5 w-3.5 text-[#E23744]" />
                        {order.deliveryAddress}
                      </p>
                    </div>
                    <span className="ml-3 shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {order.distance?.toFixed(1)} km
                    </span>
                  </div>

                  {/* Earnings row */}
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 mb-4">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-gray-400">Your earnings</p>
                      <p className="text-base font-bold text-green-600">₹{order.riderAmount}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-gray-400">Order value</p>
                      <p className="text-base font-bold text-gray-800">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptOrder(order.orderId)}
                      disabled={accepting || !!currentOrder}
                      title={currentOrder ? "Complete your current delivery first" : undefined}
                      className="flex-1 rounded-lg bg-[#E23744] py-2.5 text-sm font-semibold text-white hover:bg-[#c72f3a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {accepting ? "Accepting…" : currentOrder ? "On Delivery" : "Accept Order"}
                    </button>
                    <button
                      onClick={() => handleDeclineOrder(order.orderId)}
                      className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active delivery */}
        {currentOrder ? (
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1 bg-indigo-500" />
            <div className="px-4 pt-3 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <BiCar className="h-5 w-5 text-indigo-500" />
                <p className="font-semibold text-gray-900">Active Delivery</p>
                <span className="ml-auto rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 capitalize">
                  {currentOrder.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex gap-2">
                  <BiPackage className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{currentOrder.restaurantName}</span>
                </div>
                <div className="flex gap-2">
                  <BiMapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{currentOrder.deliveryAddress.formattedAddress}</span>
                </div>
                <div className="flex gap-2">
                  <BiPhone className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <a href={`tel:${currentOrder.deliveryAddress.mobile}`} className="text-[#E23744] underline">
                    {currentOrder.deliveryAddress.mobile}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 mb-4 text-sm">
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-400">Order Total</p>
                  <p className="font-bold text-gray-900">₹{currentOrder.totalAmount}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-400">Your Earnings</p>
                  <p className="font-bold text-green-600">₹{currentOrder.riderAmount}</p>
                </div>
              </div>

              {/* Live delivery map */}
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 bg-gray-50 border-b">
                  🗺️ Live Route
                </p>
                <DeliveryMap
                  riderPosition={riderPosition}
                  deliveryPosition={[
                    currentOrder.deliveryAddress.latitude,
                    currentOrder.deliveryAddress.longitude,
                  ]}
                  riderLabel="🚴 You"
                />
              </div>

              {currentOrder.status === "out for delivery" && (
                <button
                  onClick={handleMarkDelivered}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
                >
                  <BiCheckCircle className="h-5 w-5" />
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ) : (
          profile.isAvailable && visibleOrders.length === 0 && (
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 px-4 py-10 text-center">
              <BiCar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No orders right now</p>
              <p className="text-xs text-gray-400 mt-1">We'll notify you when a new order comes in</p>
            </div>
          )
        )}

        {/* Profile details */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 px-4 py-4 space-y-2.5 text-sm text-gray-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Profile</p>
          <div className="flex items-center gap-2">
            <BiPhone className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{profile.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <BiIdCard className="h-4 w-4 text-gray-400 shrink-0" />
            <span>Aadhar: {profile.addharNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <BiIdCard className="h-4 w-4 text-gray-400 shrink-0" />
            <span>License: {profile.drivingLicenseNumber}</span>
          </div>
          <div className="flex items-start gap-2">
            <BiMapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <span className="text-gray-500">{location?.fullAddress || "Location unavailable"}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiderDashboard;