import { useParams, useNavigate } from "react-router-dom";
import { BiLoaderAlt, BiMapPin, BiPhone, BiArrowBack } from "react-icons/bi";
import { useSingleRestaurant } from "../hooks/useRestaurant";
import { useGetMenuItems } from "../hooks/useMenuItem";
import type { MenuItem } from "../types/menuItem.types";
import { useAddToCart } from "../hooks/useCart";

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restaurant, isLoading } = useSingleRestaurant(id);
  const { items } = useGetMenuItems(id!);
const { addToCart, isLoading: addingToCart } = useAddToCart();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <BiLoaderAlt className="h-10 w-10 animate-spin text-[#E23744]" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800">Restaurant not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-[#E23744] hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-700 transition hover:text-[#E23744]"
          >
            <BiArrowBack className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Restaurant Hero Card */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="relative h-64 w-full sm:h-72 md:h-80">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
            {/* Distance badge */}
            {restaurant.distanceKm !== undefined && (
              <div className="absolute bottom-2 left-2 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
                📍 {restaurant.distanceKm} km
              </div>
            )}
            {/* Open/Closed status */}
            <div className="absolute top-2 right-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  restaurant.isOpen
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {restaurant.isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {restaurant.description}
              </p>
            )}
            
            <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                  <BiPhone className="h-5 w-5 text-[#E23744]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{restaurant.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <BiMapPin className="h-5 w-5 text-[#E23744]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium leading-snug text-gray-900">
                    {restaurant.autoLocation.formattedAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Menu</h2>
            <span className="text-sm text-gray-500">{items.length} items</span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-md">
              <p className="text-gray-500">No menu items available yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item: MenuItem) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-48 w-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white">
                          UNAVAILABLE
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-lg font-bold text-[#E23744]">
                        ₹{Number(item.price).toFixed(0)}
                      </p>
                      {item.isAvailable && (
                        <button className="rounded-lg bg-[#E23744] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#c0303c]"
                         onClick={() => addToCart({ restaurantId: restaurant._id, itemId: item._id })}
                         disabled={addingToCart}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;