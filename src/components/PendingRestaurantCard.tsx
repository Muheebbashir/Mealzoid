import { BiMapPin, BiPhone } from "react-icons/bi";
import type { Restaurant } from "../types/restaurant.types";
import { useVerifyRestaurant } from "../hooks/useAdmin";

interface Props {
  restaurant: Restaurant;
}

const PendingRestaurantCard = ({ restaurant }: Props) => {
  const { verifyRestaurant, isPending } = useVerifyRestaurant();

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="relative h-44 w-full">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-2 left-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-white">
          Pending
        </span>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
        {restaurant.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{restaurant.description}</p>
        )}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <BiMapPin className="text-[#E23744]" />
          <span className="line-clamp-1">{restaurant.autoLocation.formattedAddress}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <BiPhone className="text-[#E23744]" />
          <span>{restaurant.phone}</span>
        </div>
        <button
          onClick={() => verifyRestaurant(restaurant._id)}
          disabled={isPending}
          className="mt-2 w-full rounded-lg bg-[#E23744] py-2 text-sm font-semibold text-white hover:bg-[#c4303c] disabled:opacity-50 transition"
        >
          {isPending ? "Verifying..." : "Verify Restaurant"}
        </button>
      </div>
    </div>
  );
};

export default PendingRestaurantCard;