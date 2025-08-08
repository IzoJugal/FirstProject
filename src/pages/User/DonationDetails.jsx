import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";
import { BookType, Calendar1Icon, Camera, Frown, LocateIcon, LocationEdit, LucideType, NotebookTabs, Phone, Search, ToyBrick, TruckIcon, TypeIcon, User2 } from "lucide-react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FaAddressCard, FaAudioDescription, FaLocationArrow, FaSync } from "react-icons/fa";


const statusColors = {
    pending: "text-yellow-500",
    assigned: "text-orange-500",
    "in-progress": "text-blue-500",
    "picked-up": "text-teal-600",
    donated: "text-green-600",
    cancelled: "text-red-500",
};

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 8;


const DonationsDetails = () => {
    const { authorizationToken } = useAuth();
    const [donations, setDonations] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 6; 

    const openModal = (donation) => setSelectedDonation(donation);
    const closeModal = () => setSelectedDonation(null);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [formData, setFormData] = useState({
        scrapType: "",
        phone: "",
        description: "",
        addressLine1: "",
        addressLine2: "",
        pincode: "",
        city: "",
        country: "",
        pickupDate: "",
        pickupTime: "",
        images: [],
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const onDrop = (acceptedFiles) => {
        const validNewFiles = acceptedFiles.filter(
            (file) =>
                file.size <= MAX_SIZE_MB * 1024 * 1024 &&
                formData.images.length + acceptedFiles.length <= MAX_IMAGES
        );


        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...validNewFiles],
        }));

        const newPreviews = validNewFiles.map((file) =>
            URL.createObjectURL(file)
        );
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: true,
        maxSize: MAX_SIZE_MB * 1024 * 1024,
    });

    const handleRemoveImage = (index) => {
        const updatedImages = [...formData.images];
        const updatedPreviews = [...imagePreviews];

        updatedImages.splice(index, 1);
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);

        setFormData((prev) => ({ ...prev, images: updatedImages }));
        setImagePreviews(updatedPreviews);
    };

    const convertTo12Hour = (time24) => {
        if (!time24) return "";
        const [hourStr, minute] = time24.split(":");
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12; // Convert "0" to "12"
        return `${hour}:${minute} ${ampm}`;
    };

     const fetchDonations = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/donation`, {
                headers: {
                    Authorization: authorizationToken,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch donations");
            const data = await res.json();
            
              const sorted = (data.donations || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // newest first
        );
            setDonations(sorted || []);
            setFiltered(sorted || []);            

        } catch (error) {
            toast.error("Error loading donations");
            console.error(error);
        }
    }, [authorizationToken]);

    useEffect(() => {
        if (authorizationToken) fetchDonations();
    }, [authorizationToken, fetchDonations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const errors = [];

        if (!formData.scrapType?.trim()) errors.push("Scrap type is required.");
        if (!formData.phone?.trim() || !/^\d{10,}$/.test(formData.phone.trim())) {
            errors.push("Donor valid phone number is required.");
        }
        if (
            !formData.addressLine1?.trim() ||
            !formData.city?.trim() ||
            !formData.pincode?.trim() ||
            !formData.country?.trim()
        ) {
            errors.push("Complete address is required.");
        }
        if (!formData.pickupTime || !formData.pickupTime.trim()) {
            errors.push("Pickup time is required.");
        } else {
            // Validate time format (HH:MM, 24-hour)
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(formData.pickupTime.trim())) {
                errors.push("Pickup time must be in HH:MM format (24-hour).");
            }
            if (!formData.images || formData.images.length === 0)
                errors.push("At least one image must be uploaded.");

            if (errors.length > 0) {
                toast.error(errors.join(" "));
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const payload = new FormData();

            const formattedPickupTime = convertTo12Hour(formData.pickupTime);
            formData.pickupTime = formattedPickupTime;

            const Pincode = ["pincode"];
            // Append all non-file fields
            const numberFields = ["pincode"];
            Object.entries(formData).forEach(([key, val]) => {
                if (key !== "images") {
                    const value = numberFields.includes(key) ? Number(val) : val;
                    if (key === "pincode" && isNaN(value)) {
                        console.error("Invalid pincode:", val);
                        return toast.error("Please enter a valid pincode");
                    }
                    payload.append(key, value);
                }
            });


            // Append all images (File objects)
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
            setFormData(false);
            await fetchDonations();
            toast.success("Donation created successfully!");
        } catch (err) {
            console.error("Create donation failed:", err.response?.data || err.message);
            toast.error("Failed to create donation. Please check your input.");
        } finally {
            setIsSubmitting(false);
        }
    };

   
    // Filter logic
    useEffect(() => {
        let result = [...donations];

        if (search) {
            result = result.filter(
                (d) =>
                    d.name?.toLowerCase().includes(search.toLowerCase()) ||
                    d.phone?.includes(search)
            );
        }

        if (statusFilter) {
            result = result.filter((d) => d.status === statusFilter);
        }


        setFiltered(result);
    }, [search, statusFilter, donations]);


    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

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


            {/* Filters + Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <input
                    type="text"
                    placeholder="Search by name or phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-sm shadow-sm"
                />

                <select
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-sm shadow-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked-up">Picked Up</option>
                    <option value="donated">Donated</option>
                </select>
            </div>


            {/* Donation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((donation) => (
                    <div
                        key={donation._id}
                        className="p-4 border rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300 space-y-3"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-lg capitalize">
                                {donation.scrapType || "Unnamed Donor"}
                            </h2>
                        </div>

                        {/* Summary */}
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone /> {donation.phone}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <ToyBrick /> Type: {donation.scrapType || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar1Icon /> Date: {new Date(donation.createdAt).toLocaleDateString("en-GB")}
                        </p>
                        <p className={`text-sm font-medium flex items-center gap-1 ${statusColors[donation.status] || "text-gray-600"}`}>
                            <FaSync /> Status: {donation.status}
                        </p>

                        <button
                            onClick={() => openModal(donation)}
                            className="text-sm text-blue-600 hover:underline self-start"
                        >
                            View Details
                        </button>

                        {/* Modal */}
                        {selectedDonation && (
                            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border">
                                    {/* Close */}
                                    <button
                                        className="absolute top-3 right-4 text-gray-400 hover:text-black text-2xl"
                                        onClick={closeModal}
                                        aria-label="Close"
                                    >
                                        ×
                                    </button>

                                    {/* Title */}
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                                        {selectedDonation.scrapType || "Unnamed Donor"}
                                    </h2>

                                    {/* Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                        <p><Phone /> <strong>Phone:</strong> {selectedDonation.phone}</p>
                                        <p><BookType /> <strong>Type:</strong> {selectedDonation.scrapType}</p>
                                        <p><Calendar1Icon /> <strong>Date:</strong> {new Date(selectedDonation.createdAt).toLocaleDateString("en-GB")}</p>
                                        <p><FaSync /> <strong>Status:</strong> {selectedDonation.status}</p>

                                        {selectedDonation.pickupDate && (
                                            <p className="sm:col-span-2"><TruckIcon /> <strong>Pickup:</strong> {new Date(selectedDonation.pickupDate).toLocaleDateString("en-GB")} ({selectedDonation.pickupTime || "N/A"})</p>
                                        )}

                                        <p className="sm:col-span-2"><FaAddressCard /> <strong>Address:</strong> {
                                            [selectedDonation.addressLine1, selectedDonation.addressLine2, selectedDonation.city, selectedDonation.pincode, selectedDonation.country]
                                                .filter(Boolean).join(", ")
                                        }</p>

                                        {selectedDonation.description && (
                                            <p className="sm:col-span-2"><NotebookTabs /> <strong>Description:</strong> {selectedDonation.description}</p>
                                        )}

                                        {selectedDonation.dealer && (
                                            <p className="sm:col-span-2">
                                                <User2 /> <strong>Dealer:</strong> {selectedDonation.dealer?.firstName} {selectedDonation.dealer?.lastName} - {selectedDonation.dealer?.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Images */}
                                    {selectedDonation?.images?.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1"><Camera /> Images:</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {selectedDonation.images.map((img, idx) => {
                                                    const imageUrl = `${import.meta.env.VITE_BACK_URL}/auth${img?.url || ""}`;
                                                    return (
                                                        <img
                                                            key={img?._id || idx}
                                                            src={imageUrl}
                                                            alt={`donation-img-${idx}`}
                                                            loading="lazy"
                                                            className="w-full h-24 object-cover rounded-md border border-gray-200 cursor-pointer hover:scale-105 transition-transform duration-200"
                                                            onClick={() => setPreviewImage(imageUrl)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Image Preview */}
                                {previewImage && (
                                    <div
                                        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                                        onClick={() => setPreviewImage(null)}
                                    >
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
                                        />
                                        <button
                                            onClick={() => setPreviewImage(null)}
                                            className="absolute top-6 right-6 text-white text-3xl font-bold hover:scale-110"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide relative shadow-2xl border border-gray-200 transition-all duration-300 scroll-smooth">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
                            onClick={() => setShowCreateModal(false)}
                        >
                            ×
                        </button>

                        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                            Create New Donation
                        </h2>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {[
                                ["scrapType", "Scrap Type", "e.g. Plastic, Metal"],
                                ["phone", "Phone Number"],
                                ["description", "Description"],
                                ["addressLine1", "Address Line 1"],
                                ["addressLine2", "Address Line 2"],
                                ["pincode", "Pincode"],
                                ["city", "City"],
                                ["country", "Country"],
                                ["pickupDate", "Pickup Date", "", "date"],
                                ["pickupTime", "Pickup Time", "", "time"],
                            ].map(([name, label, placeholder = "", type = "text"]) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        name={name}
                                        placeholder={placeholder}
                                        value={formData[name]}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    />
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
                                    <p className="text-gray-600">Drag & drop or click to select images</p>
                                </div>
                                {validationErrors.images && (
                                    <p className="text-sm text-red-500 mt-1">{validationErrors.images}</p>
                                )}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="relative border rounded overflow-hidden">
                                                <img src={src} alt={`Preview ${index}`} className="w-full h-36 object-cover" />
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
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
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
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                            ></path>
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
                    <Frown className="w-8 h-8 animate-spin" />
                    {/* <span>No donations found.</span> */}
                </div>
            )}
               {filtered.length > pageSize && (
                <div className="flex justify-center mt-6 gap-2 items-center text-sm">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md border ${currentPage === 1 ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-blue-600 border-blue-500 hover:bg-blue-50"}`}
                    >
                        Previous
                    </button>

                    <span className="font-medium">
                        Page {currentPage} of {Math.ceil(filtered.length / pageSize)}
                    </span>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(filtered.length / pageSize)))}
                        disabled={currentPage === Math.ceil(filtered.length / pageSize)}
                        className={`px-3 py-1 rounded-md border ${currentPage === Math.ceil(filtered.length / pageSize) ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-blue-600 border-blue-500 hover:bg-blue-50"}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default DonationsDetails;
