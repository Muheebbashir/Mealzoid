import { useNavigate } from "react-router-dom";
import { BiMapPin } from "react-icons/bi";
import type { Restaurant } from "../types/restaurant.types";

interface Props {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
      className="cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-48 w-full">
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
        <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
        {restaurant.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{restaurant.description}</p>
        )}
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <BiMapPin className="mr-1 h-4 w-4 text-[#E23744]" />
          <span className="line-clamp-1">{restaurant.autoLocation.formattedAddress}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;