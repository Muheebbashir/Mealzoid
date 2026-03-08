import { BiTrash } from "react-icons/bi";
import { useGetMenuItems, useDeleteMenuItem, useToggleMenuItemAvailability } from "../hooks/useMenuItem";
import type { MenuItem } from "../types/menuItem.types";

interface Props {
  restaurantId: string;
}

const MenuItemsList = ({ restaurantId }: Props) => {
  const { items, isLoading } = useGetMenuItems(restaurantId);
  const { deleteMenuItem } = useDeleteMenuItem();
  const { toggleAvailability } = useToggleMenuItemAvailability();

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading menu items...</p>;
  }

  if (items.length === 0) {
    return <p className="text-center text-gray-500">No menu items yet. Add your first item!</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item: MenuItem) => (
        <div key={item._id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {/* Image container with overlay */}
          <div className="relative h-48 w-full">
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-full w-full object-cover" 
            />
            {/* Unavailable overlay */}
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
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>
            )}
            <p className="mt-2 text-lg font-bold text-[#E23744]">₹{item.price}</p>
            
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => toggleAvailability(item._id)}
                className={`flex-1 rounded px-3 py-1.5 text-sm font-medium text-white transition ${
                  item.isAvailable 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this item?")) {
                    deleteMenuItem(item._id);
                  }
                }}
                className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
              >
                <BiTrash size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuItemsList;