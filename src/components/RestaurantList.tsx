import { useSearchParams } from "react-router-dom";
import { BiLoaderAlt } from "react-icons/bi";
import { useUserLocation } from "../hooks/useLocation";
import { useNearbyRestaurants } from "../hooks/useRestaurant";
import RestaurantCard from "./RestaurantCard";

const RestaurantList = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  
  const { location, isLoading: locationLoading, geoError } = useUserLocation();
  const { restaurants, isLoading, count } = useNearbyRestaurants(
    location?.coords.lat,
    location?.coords.lon,
    5000,
    search
  );

  if (locationLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <BiLoaderAlt className="mx-auto h-8 w-8 animate-spin text-[#E23744]" />
          <p className="mt-2 text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Location Access Required</p>
          <p className="text-sm text-gray-500">{geoError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Results count */}
      {!isLoading && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {search ? (
              <>
                Found {count} result{count !== 1 ? "s" : ""} for "{search}"
              </>
            ) : (
              <>
                {count} restaurant{count !== 1 ? "s" : ""} near you
              </>
            )}
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && restaurants.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-gray-700">No restaurants found</p>
          <p className="text-sm text-gray-500">
            {search ? `No results for "${search}"` : "No restaurants nearby"}
          </p>
        </div>
      )}

      {/* Restaurant grid */}
      {!isLoading && restaurants.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
