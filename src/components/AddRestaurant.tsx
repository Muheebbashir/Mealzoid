import { useState } from "react";
import { BiImageAdd, BiStore } from "react-icons/bi";
import { useUserLocation } from "../hooks/useLocation";
import { useCreateRestaurant } from "../hooks/useCreateRestaurant";

const AddRestaurant = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string>("");

  const { location, isLoading: locationLoading, geoError } = useUserLocation();
  const { createRestaurant, isLoading } = useCreateRestaurant();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location || !location.coords) {
      alert("Please wait for location to load");
      return;
    }

    if (!formData.image) {
      alert("Please upload an image");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("phone", formData.phone);
    data.append("latitude", location.coords.lat.toString());
    data.append("longitude", location.coords.lon.toString());
    data.append("formattedAddress", location.fullAddress);
    data.append("file", formData.image);

    createRestaurant(data);
  };

  if (locationLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Getting your location...</p>
          <p className="text-sm text-gray-500">Please allow location access</p>
        </div>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Location Access Required</p>
          <p className="text-sm text-gray-500">{geoError}</p>
          <p className="mt-2 text-xs text-gray-400">
            Please enable location in your browser settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 text-center sm:mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E23744] sm:h-16 sm:w-16 sm:mb-4">
            <BiStore className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Create Your Restaurant
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Fill in the details below to list your restaurant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-4 shadow sm:p-6">
          {/* Restaurant Name */}
          <div className="mb-4 sm:mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">
              Restaurant Name <span className="text-[#E23744]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pizza Palace"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20 sm:px-4 sm:py-2.5 sm:text-base"
            />
          </div>

          {/* Description */}
          <div className="mb-4 sm:mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell customers about your restaurant..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20 sm:px-4 sm:py-2.5 sm:text-base"
            />
          </div>

          {/* Phone */}
          <div className="mb-4 sm:mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">
              Phone Number <span className="text-[#E23744]">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20 sm:px-4 sm:py-2.5 sm:text-base"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-5 sm:mb-6">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 sm:mb-2">
              Restaurant Image <span className="text-[#E23744]">*</span>
            </label>
            <div className="flex items-center gap-4">
              {preview ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-lg sm:h-32 sm:w-32">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: null });
                      setPreview("");
                    }}
                    className="absolute right-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600 sm:right-2 sm:top-2 sm:px-2 sm:py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#E23744] sm:h-32 sm:w-32">
                  <BiImageAdd className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                  <span className="mt-1 text-xs text-gray-500 sm:mt-2">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Location Display */}
          {location && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Your Location</p>
                  <p className="text-sm font-medium text-gray-900">📍 {location.fullAddress}</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="ml-2 text-xs font-semibold text-[#E23744] hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || locationLoading || !location}
            className="w-full rounded-lg bg-[#E23744] py-2.5 text-sm font-semibold text-white transition hover:bg-[#c0303c] disabled:opacity-50 sm:py-3 sm:text-base"
          >
            {locationLoading ? "Getting location..." : isLoading ? "Creating..." : "Create Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;