import { BiEdit, BiMapPin, BiSave, BiLogOut } from "react-icons/bi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "../types/restaurant.types";
import { useUpdateRestaurantStatus, useUpdateRestaurantDetails } from "../hooks/useUpdateRestaurant";
import { useLogout } from "../hooks/useLogout";
import toast from "react-hot-toast";

interface Props {
  restaurant: Restaurant;
  isSeller?: boolean;
  onUpdate: (restaurant: Restaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description || "");
  const navigate = useNavigate();

  const { updateStatus } = useUpdateRestaurantStatus();
  const { updateDetails, isLoading } = useUpdateRestaurantDetails();
  const { logout } = useLogout();

  const toggleOpenStatus = () => {
    updateStatus(!restaurant.isOpen, {
      onSuccess: (data) => {
        onUpdate(data.restaurant);
      },
    });
  };

  const saveChanges = () => {
    updateDetails({ name, description }, {
      onSuccess: (data) => {
        onUpdate(data.restaurant);
        setEditMode(false);
      },
    });
  };

  const handleLogout = async () => {
    // If restaurant is open, close it first
    if (restaurant.isOpen) {
      updateStatus(false, {
        onSuccess: () => {
          toast.success("Restaurant closed");
          logout();
          navigate("/login");
        },
        onError: () => {
          // Logout anyway even if closing fails
          logout();
          navigate("/login");
        }
      });
    } else {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white shadow-sm overflow-hidden">
      {restaurant.image && (
        <img src={restaurant.image} alt={restaurant.name} className="h-48 w-full object-cover" />
      )}
      <div className="p-5 space-y-4">
        {isSeller && (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editMode ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border px-2 py-1 text-lg font-semibold"
                />
              ) : (
                <h2 className="text-xl font-semibold">{restaurant.name}</h2>
              )}
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <BiMapPin className="h-4 w-4 text-red-500" />
                {restaurant.autoLocation.formattedAddress || "Location not available"}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditMode(!editMode)} 
                className="text-gray-500 hover:text-black"
              >
                <BiEdit size={18} />
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition"
                title="Logout"
              >
                <BiLogOut size={18} />
              </button>
            </div>
          </div>
        )}
        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            rows={3}
          />
        ) : (
          <p className="text-gray-600 text-sm">{restaurant.description || "No description provided."}</p>
        )}
        <div className="flex flex-col gap-3 pt-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <span className={`font-medium ${restaurant.isOpen ? "text-green-500" : "text-red-500"}`}>
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>
          <div className="flex flex-wrap gap-2">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <BiSave size={16} />
                Save
              </button>
            )}
            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                disabled={!restaurant.isVerified}
                title={!restaurant.isVerified ? "Restaurant not verified yet" : undefined}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition ${
                  !restaurant.isVerified
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : restaurant.isOpen
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {restaurant.isOpen ? "Mark as Closed" : "Mark as Open"}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400">Created on {new Date(restaurant.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default RestaurantProfile;