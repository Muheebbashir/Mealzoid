import { useState } from "react";
import { BiImageAdd } from "react-icons/bi";
import { useAddMenuItem } from "../hooks/useMenuItem";

const AddMenuItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string>("");

  const { addMenuItem, isLoading } = useAddMenuItem();

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

    if (!formData.image) {
      alert("Please upload an image");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("file", formData.image);

    addMenuItem(data, {
      onSuccess: () => {
        // Reset form
        setFormData({ name: "", description: "", price: "", image: null });
        setPreview("");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Item Name <span className="text-[#E23744]">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Margherita Pizza"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your item..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Price (₹) <span className="text-[#E23744]">*</span>
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="e.g. 299"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#E23744] focus:ring-2 focus:ring-[#E23744]/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
          Image <span className="text-[#E23744]">*</span>
        </label>
        <div className="flex items-center gap-4">
          {preview ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, image: null });
                  setPreview("");
                }}
                className="absolute right-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-[#E23744]">
              <BiImageAdd className="h-6 w-6 text-gray-400" />
              <span className="mt-1 text-xs text-gray-500">Upload</span>
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[#E23744] py-2.5 text-sm font-semibold text-white transition hover:bg-[#c0303c] disabled:opacity-50"
      >
        {isLoading ? "Adding..." : "Add Menu Item"}
      </button>
    </form>
  );
};

export default AddMenuItem;