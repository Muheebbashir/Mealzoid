import { useState } from "react";
import { usePendingRestaurants, usePendingRiders } from "../hooks/useAdmin";
import PendingRestaurantCard from "../components/PendingRestaurantCard";
import PendingRiderCard from "../components/PendingRiderCard";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "../types/restaurant.types";
import type { Rider } from "../types/rider.types";

type Tab = "restaurants" | "riders";

const AdminDashboard = () => {
  const [tab, setTab] = useState<Tab>("restaurants");
  const { restaurants, count: rCount, isLoading: rLoading } = usePendingRestaurants();
  const { riders, count: dCount, isLoading: dLoading } = usePendingRiders();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-[#E23744]">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b bg-white px-6">
        <button
          onClick={() => setTab("restaurants")}
          className={`mr-6 py-3 text-sm font-semibold border-b-2 transition ${
            tab === "restaurants"
              ? "border-[#E23744] text-[#E23744]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Restaurants
          {rCount > 0 && (
            <span className="ml-2 rounded-full bg-[#E23744] px-2 py-0.5 text-xs text-white">
              {rCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("riders")}
          className={`py-3 text-sm font-semibold border-b-2 transition ${
            tab === "riders"
              ? "border-[#E23744] text-[#E23744]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Riders
          {dCount > 0 && (
            <span className="ml-2 rounded-full bg-[#E23744] px-2 py-0.5 text-xs text-white">
              {dCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <main className="px-6 py-6">
        {tab === "restaurants" && (
          <>
            {rLoading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E23744] border-t-transparent" />
              </div>
            ) : restaurants.length === 0 ? (
              <p className="text-center text-gray-400 py-20">No pending restaurants</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {restaurants.map((r: Restaurant) => (
                  <PendingRestaurantCard key={r._id} restaurant={r} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "riders" && (
          <>
            {dLoading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E23744] border-t-transparent" />
              </div>
            ) : riders.length === 0 ? (
              <p className="text-center text-gray-400 py-20">No pending riders</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {riders.map((r: Rider) => (
                  <PendingRiderCard key={r._id} rider={r} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;