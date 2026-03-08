import { useState } from "react";
import {  BiPhone, BiIdCard, BiImage } from "react-icons/bi";
import { useCreateRiderProfile } from "../hooks/useRider";
import { useUserLocation } from "../hooks/useLocation";
import toast from "react-hot-toast";

const CreateRiderProfile = () => {
  const { createProfile, isLoading } = useCreateRiderProfile();
  const { location } = useUserLocation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [addharNumber, setAddharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please upload a profile picture");
      return;
    }

    if (!location?.coords) {
      toast.error("Location not available. Please enable location access.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("phoneNumber", phoneNumber);
    formData.append("addharNumber", addharNumber);
    formData.append("drivingLicenseNumber", drivingLicenseNumber);
    formData.append("latitude", location.coords.lat.toString());
    formData.append("longitude", location.coords.lon.toString());

    createProfile(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Create Rider Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <label className="mb-2 flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 hover:border-[#E23744]">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <BiImage className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-xs text-gray-500">Upload Photo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
            </label>
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              <BiPhone className="mb-1 inline h-4 w-4" /> Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              required
              className="w-full rounded-lg border px-4 py-2 outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20"
            />
          </div>

          {/* Aadhar Number */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              <BiIdCard className="mb-1 inline h-4 w-4" /> Aadhar Number
            </label>
            <input
              type="text"
              value={addharNumber}
              onChange={(e) => setAddharNumber(e.target.value)}
              placeholder="Enter Aadhar number"
              required
              maxLength={12}
              className="w-full rounded-lg border px-4 py-2 outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20"
            />
          </div>

          {/* Driving License */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              <BiIdCard className="mb-1 inline h-4 w-4" /> Driving License Number
            </label>
            <input
              type="text"
              value={drivingLicenseNumber}
              onChange={(e) => setDrivingLicenseNumber(e.target.value)}
              placeholder="Enter license number"
              required
              className="w-full rounded-lg border px-4 py-2 outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#E23744] py-3 font-semibold text-white transition hover:bg-[#c0303c] disabled:opacity-50"
          >
            {isLoading ? "Creating Profile..." : "Create Profile"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Your profile will be verified by admin before you can start accepting orders
        </p>
      </div>
    </div>
  );
};

export default CreateRiderProfile;