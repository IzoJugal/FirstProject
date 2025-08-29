import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";
import { Frown } from "lucide-react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Constants
const MAX_IMAGES = 5;
const MAX_SIZE_MB = 8;

// Define interfaces for type safety
interface Donation {
  _id: string;
  scrapType?: string;
  phone?: string;
  description?: string;
  city?: string;
  district?: string;
  status:
    | "pending"
    | "assigned"
    | "picked_up"
    | "donated"
    | "unassigned"
    | "cancelled";
  createdAt: string;
  images?: { url: string }[];
}

interface FormData {
  scrapType: string;
  phone: string;
  description: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  district: string;
  country: string;
  pickupDate: string;
  pickupTime: string;
  images: File[];
}

interface ValidationErrors {
  [key: string]: string;
}

interface AuthContext {
  authorizationToken: string;
}

interface PincodeResponse {
  Status: string;
  PostOffice?: { Block: string; District: string; Country: string }[];
}

const DonationsDetails: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filtered, setFiltered] = useState<Donation[]>([]);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    scrapType: "",
    phone: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    city: "",
    district: "",
    country: "",
    pickupDate: "",
    pickupTime: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Clean up image previews
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Fetch address by pincode
  const fetchAddressByPincode = async (pincode: string): Promise<void> => {
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data: PincodeResponse[] = await response.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length! > 0) {
        const postOffice = data[0].PostOffice![0];
        setFormData((prev) => ({
          ...prev,
          city: postOffice.Block || "",
          district: postOffice.District || "",
          country: postOffice.Country || "India",
        }));
        toast.success("Address details fetched successfully!");
      } else {
        toast.error("Invalid pincode or no data found.");
      }
    } catch (err: any) {
      toast.error("Error fetching address details.");
      console.error(err);
    }
  };

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    const errors: ValidationErrors = {};

    const fieldsWithMinLength = [
      "scrapType",
      "description",
      "addressLine1",
      "addressLine2",
      "city",
      "district",
      "country",
    ];
    if (
      fieldsWithMinLength.includes(name) &&
      value.trim().length > 0 &&
      value.trim().length < 5
    ) {
      errors[name] = `${name
        .replace(/([A-Z])/g, " $1")
        .trim()} must be at least 5 characters.`;
    }

    if (name === "phone") {
      if (!/^[6-9]\d{0,9}$/.test(value)) {
        errors.phone = "Phone must start with 6-9 and be up to 10 digits.";
      } else if (value.length > 0 && value.length !== 10) {
        errors.phone = "Phone number must be exactly 10 digits.";
      }
    }

    if (name === "pincode") {
      if (!/^\d{0,6}$/.test(value)) {
        errors.pincode = "Pincode must be numeric and 6 digits.";
      } else if (value.length === 6) {
        fetchAddressByPincode(value);
      }
    }

    if (name === "pickupTime") {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (value && !timeRegex.test(value)) {
        errors.pickupTime = "Use HH:MM in 24-hour format.";
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
  };

  // Handle image drop
  const onDrop = useCallback(
    (acceptedFiles: File[]): void => {
      const validNewFiles = acceptedFiles.filter(
        (file) =>
          file.size <= MAX_SIZE_MB * 1024 * 1024 &&
          formData.images.length + acceptedFiles.length <= MAX_IMAGES
      );

      if (validNewFiles.length < acceptedFiles.length) {
        toast.error(
          `Some files were rejected: Max ${MAX_IMAGES} images or ${MAX_SIZE_MB}MB per file.`
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validNewFiles],
      }));

      const newPreviews = validNewFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
    [formData.images]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif"] },
    multiple: true,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
  });

  // Remove image
  const handleRemoveImage = (index: number): void => {
    const updatedImages = [...formData.images];
    const updatedPreviews = [...imagePreviews];
    updatedImages.splice(index, 1);
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedPreviews);
  };

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24: string): string => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  // Fetch donations
  const fetchDonations = useCallback(async (): Promise<void> => {
    try {
      const res = await axios.get<{ donations: Donation[] }>(
        `${import.meta.env.VITE_BACK_URL}/auth/donation`,
        {
          headers: {
            Authorization: authorizationToken,
          },
        }
      );
      const sorted = (res.data.donations || []).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setDonations(sorted);
      setFiltered(sorted);
    } catch (error: any) {
      toast.error("Error loading donations");
      console.error(error);
    }
  }, [authorizationToken]);

  useEffect(() => {
    if (authorizationToken) fetchDonations();
  }, [authorizationToken, fetchDonations]);

  // Handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    const errors: string[] = [];

    if (!formData.scrapType?.trim()) errors.push("Scrap type is required.");
    if (
      !formData.phone?.trim() ||
      !/^[6-9]\d{9}$/.test(formData.phone.trim())
    ) {
      errors.push("Valid 10-digit phone number is required.");
    }
    if (
      !formData.addressLine1?.trim() ||
      !formData.city?.trim() ||
      !formData.district?.trim() ||
      !formData.pincode?.trim() ||
      !formData.country?.trim()
    ) {
      errors.push(
        "Complete address is required, including city, district, pincode, and country."
      );
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      errors.push("Pincode must be a valid 6-digit number.");
    }
    if (!formData.pickupDate) {
      errors.push("Pickup date is required.");
    }
    if (!formData.pickupTime || !formData.pickupTime.trim()) {
      errors.push("Pickup time is required.");
    } else {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(formData.pickupTime.trim())) {
        errors.push("Pickup time must be in HH:MM format (24-hour).");
      }
    }
    if (formData.images.length === 0) {
      errors.push("At least one image must be uploaded.");
      setValidationErrors((prev) => ({
        ...prev,
        images: "At least one image is required.",
      }));
    }

    if (errors.length > 0) {
      toast.error(errors.join(" "));
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      const formattedPickupTime = convertTo12Hour(formData.pickupTime);
      const pincode = Number(formData.pincode);

      if (isNaN(pincode)) {
        toast.error("Please enter a valid pincode");
        setIsSubmitting(false);
        return;
      }

      const dataToSend: {
        pincode: number;
        pickupTime: string;
        [key: string]: any;
      } = {
        ...formData,
        pickupTime: formattedPickupTime,
        pincode,
      };

      Object.entries(dataToSend).forEach(([key, val]) => {
        if (key !== "images" && val !== null && val !== undefined) {
          payload.append(key, val.toString());
        }
      });

      formData.images.forEach((img) => {
        payload.append("images", img);
      });

      await axios.post(
        `${import.meta.env.VITE_BACK_URL}/auth/donate`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: authorizationToken,
          },
        }
      );

      setShowCreateModal(false);
      setFormData({
        scrapType: "",
        phone: "",
        description: "",
        addressLine1: "",
        addressLine2: "",
        pincode: "",
        city: "",
        district: "",
        country: "",
        pickupDate: "",
        pickupTime: "",
        images: [],
      });
      setImagePreviews([]);
      setValidationErrors({});
      await fetchDonations();
      toast.success("Donation created successfully!");
    } catch (err: any) {
      console.error(
        "Create donation failed:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create donation. Please check your input.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialFormData: FormData = {
    scrapType: "",
    phone: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    city: "",
    district: "",
    country: "",
    pickupDate: "",
    pickupTime: "",
    images: [],
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setImagePreviews([]);
    setValidationErrors({});
  };

  // Filter donations
  useEffect(() => {
    let result = [...donations];

    if (search) {
      result = result.filter(
        (d) =>
          d.scrapType?.toLowerCase().includes(search.toLowerCase()) ||
          d.phone?.includes(search)
      );
    }

    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }

    setFiltered(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [search, statusFilter, donations]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  const getMinPickupDate = (): string => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    return today.toISOString().split("T")[0];
  };

  const handleCardClick = (id: string): void => {
    navigate(`/donation/${id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">All Donations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 text-sm font-medium"
        >
          + Create Donation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <input
          type="text"
          placeholder="Search by Scrap Type or Phone"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-sm shadow-sm"
        />
        <select
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-sm shadow-sm"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="picked_up">Picked Up</option>
          <option value="donated">Donated</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginated.map((donation) => (
          <div
            key={donation._id}
            className="bg-white shadow-md rounded-2xl flex items-center overflow-hidden border hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleCardClick(donation._id)}
          >
            <img
              src={
                donation.images?.[0]
                  ? `${import.meta.env.VITE_BACK_URL}/auth${
                      donation.images[0].url
                    }`
                  : "https://via.placeholder.com/100"
              }
              alt="Scrap"
              className="w-24 h-24 object-cover"
              onError={(e) =>
                (e.currentTarget.src = "https://via.placeholder.com/100")
              }
            />
            <div className="flex-1 px-4 py-2 space-y-1">
              <h3 className="font-semibold text-base text-gray-800 capitalize">
                {donation.scrapType || "Old Item"}
              </h3>
              <p className="text-sm text-green-700 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full inline-block"></span>
                {donation.city && donation.district
                  ? `${donation.city}, ${donation.district}`
                  : "Location unavailable"}
              </p>
              <p className="text-sm text-gray-500 line-clamp-1">
                {donation.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                    donation.status === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : donation.status === "donated"
                      ? "bg-green-100 text-green-600"
                      : donation.status === "assigned"
                      ? "bg-blue-100 text-blue-600"
                      : donation.status === "unassigned"
                      ? "bg-gray-100 text-gray-600"
                      : donation.status === "picked_up"
                      ? "bg-purple-100 text-purple-600"
                      : donation.status === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {donation.status}
                </span>
                <span className="text-xs bg-white text-gray-500 border px-2 py-0.5 rounded-full">
                  {new Date(donation.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide relative shadow-2xl border border-gray-200 transition-all duration-300 scroll-smooth">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => {
                resetForm();
                setShowCreateModal(false);
              }}
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
              Create New Donation
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {(
                [
                  [
                    "scrapType",
                    "Scrap Type",
                    "Enter type of scrap (e.g. Plastic, Metal, NewsPaper, etc.)",
                  ],
                  ["phone", "Phone Number", "e.g. 9876543210", "tel"],
                  [
                    "description",
                    "Description",
                    "Describe the scrap items — condition, quantity, or any special instructions",
                  ],
                  ["addressLine1", "Address Line 1", "e.g. 123 Main St"],
                  ["addressLine2", "Address Line 2", "e.g. Apt 4B"],
                  ["pincode", "Pincode", "Enter 6-digit pincode", "text"],
                  ["city", "City", "e.g. Surat City"],
                  ["district", "District", "e.g. Surat"],
                  ["country", "Country", "India"],
                  ["pickupDate", "Pickup Date", "", "date"],
                  ["pickupTime", "Pickup Time", "", "time"],
                ] as [string, string, string, string?][]
              ).map(([name, label, placeholder = "", type = "text"]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    {...(type !== "file" && {
                      value: formData[name as keyof typeof formData] as
                        | string
                        | number
                        | undefined,
                    })}
                    onChange={handleInputChange}
                    min={name === "pickupDate" ? getMinPickupDate() : undefined}
                    className={`w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none ${
                      validationErrors[name] ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors[name] && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors[name]}
                    </p>
                  )}
                </div>
              ))}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Upload Images (Max {MAX_IMAGES}, {MAX_SIZE_MB}MB each)
                </label>
                <div
                  {...getRootProps()}
                  className="w-full border-2 border-dashed border-green-400 p-6 rounded-xl text-center cursor-pointer bg-green-50 hover:bg-green-100"
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-600">
                    Drag & drop or click to select images
                  </p>
                </div>
                {validationErrors.images && (
                  <p className="text-sm text-red-500 mt-1">
                    {validationErrors.images}
                  </p>
                )}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((src, index) => (
                      <div
                        key={index}
                        className="relative border rounded overflow-hidden"
                      >
                        <img
                          src={src}
                          alt={`Preview ${index}`}
                          className="w-full h-36 object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white text-xs p-1 rounded-full hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center text-red-500 font-semibold py-14 flex flex-col items-center justify-center gap-2">
          <Frown className="w-8 h-8" />
          <p>No donations found.</p>
        </div>
      )}
      {filtered.length > pageSize && (
        <div className="flex justify-center mt-6 gap-2 items-center text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-500 hover:bg-blue-50"
            }`}
          >
            Previous
          </button>
          <span className="font-medium">
            Page {currentPage} of {Math.ceil(filtered.length / pageSize)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, Math.ceil(filtered.length / pageSize))
              )
            }
            disabled={currentPage === Math.ceil(filtered.length / pageSize)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === Math.ceil(filtered.length / pageSize)
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-500 hover:bg-blue-50"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationsDetails;
