import { useState } from "react";
import { BiLoaderAlt, BiTrash, BiPlus } from "react-icons/bi";
import { useMyAddresses, useDeleteAddress } from "../hooks/useAddress";
import AddAddressModal from "../components/AddAddressModal";

const Address = () => {
  const { addresses, isLoading } = useMyAddresses();
  const { deleteAddress } = useDeleteAddress();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BiLoaderAlt className="h-8 w-8 animate-spin text-[#E23744]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Addresses</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#E23744] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#c0303c] sm:gap-2 sm:px-4"
          >
            <BiPlus size={18} />
            <span>Add Address</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mb-3 text-4xl">📍</div>
            <p className="font-semibold text-gray-700">No addresses saved yet</p>
            <p className="mt-1 text-sm text-gray-500">Add your delivery address to get started</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1 text-[#E23744] hover:underline"
            >
              <BiPlus size={16} />
              Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{address.formattedAddress}</p>
                    <p className="mt-1 text-sm text-gray-600">📱 {address.mobile}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {address.location.coordinates[1].toFixed(4)},{" "}
                      {address.location.coordinates[0].toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Delete this address?")) {
                        deleteAddress(address._id);
                      }
                    }}
                    className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                  >
                    <BiTrash size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddAddressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Address;