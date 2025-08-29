import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosResponse } from "axios";
import {
  ArrowLeftIcon,
  CameraIcon,
  FrownIcon,
  Pencil,
  Trash2Icon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext/Auth";
import { useNavigate } from "react-router-dom";

// Define interfaces for data structures
interface Shelter {
  _id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email: string;
  address: string;
  capacity: number | string;
  currentOccupancy?: number | string;
  profileImage?: string;
  isActive: boolean;
}

interface NewShelter {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  capacity: string;
  profileImage: File | null;
}

interface AuthContext {
  authorizationToken: string;
}

interface ShelterResponse {
  success: boolean;
  shelters?: Shelter[];
  shelter?: Shelter;
}

const SheltersDetails: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [query, setQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const sheltersPerPage: number = 6;
  const [editShelter, setEditShelter] = useState<Shelter | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [cloading, setCLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [shelterToDelete, setShelterToDelete] = useState<string | null>(null);
  const [newShelter, setNewShelter] = useState<NewShelter>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    capacity: "",
    profileImage: null,
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const fetchShelters = useCallback(async () => {
    try {
      const res: AxiosResponse<ShelterResponse> = await axios.get(
        `${import.meta.env.VITE_BACK_URL}/admin/shelters`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setShelters(res.data.shelters || []);
    } catch (err) {
      toast.error("Failed to load shelters");
      console.error(err);
    }
  }, [authorizationToken]);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const newStatus = !current;
      const res: AxiosResponse<ShelterResponse> = await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/shelter/${id}/active`,
        { isActive: newStatus },
        { headers: { Authorization: authorizationToken } }
      );

      if (res.data.success) {
        setShelters((prev) =>
          prev.map((shelter) =>
            shelter._id === id ? { ...shelter, isActive: newStatus } : shelter
          )
        );
        toast.success(`Shelter is now ${newStatus ? "Active" : "Inactive"}`);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Failed to toggle shelter status. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!shelterToDelete) return;
    try {
      const res: AxiosResponse<ShelterResponse> = await axios.delete(
        `${import.meta.env.VITE_BACK_URL}/admin/shelter/${shelterToDelete}`,
        { headers: { Authorization: authorizationToken } }
      );

      if (res.data.success) {
        setShelters((prev) => prev.filter((s) => s._id !== shelterToDelete));
        toast.success("Shelter deleted successfully.");
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not delete shelter. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setShelterToDelete(null);
    }
  };

  const createShelter = async () => {
    if (
      !newShelter.name ||
      !newShelter.phone ||
      !newShelter.address ||
      !newShelter.email
    ) {
      toast.error("Name, Phone, Email, and Address are required");
      return;
    }

    setCLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newShelter.name);
      formData.append("contactPerson", newShelter.contactPerson || "");
      formData.append("phone", newShelter.phone);
      formData.append("email", newShelter.email);
      formData.append("address", newShelter.address);
      formData.append("capacity", newShelter.capacity || "0");
      if (newShelter.profileImage instanceof File) {
        formData.append("profileImage", newShelter.profileImage);
      }

      const res: AxiosResponse<ShelterResponse> = await axios.post(
        `${import.meta.env.VITE_BACK_URL}/admin/shelters`,
        formData,
        {
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success && res.data.shelter) {
        const shelter: Shelter = res.data.shelter;
        setShelters((prev) => [shelter, ...prev]);
        toast.success("Shelter created successfully");
        setShowCreateModal(false);
        setNewShelter({
          name: "",
          contactPerson: "",
          phone: "",
          email: "",
          address: "",
          capacity: "",
          profileImage: null,
        });
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      toast.error("Failed to create shelter");
      console.error(err);
    } finally {
      setCLoading(false);
    }
  };

  const updateDetails = async () => {
    if (!editShelter) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editShelter.name);
      formData.append("contactPerson", editShelter.contactPerson || "");
      formData.append("phone", editShelter.phone);
      formData.append("address", editShelter.address);
      formData.append("capacity", editShelter.capacity.toString() || "0");
      formData.append(
        "currentOccupancy",
        editShelter.currentOccupancy?.toString() || "0"
      );

      if (
        editShelter.profileImage &&
        typeof editShelter.profileImage !== "string"
      ) {
        formData.append("profileImage", editShelter.profileImage as File);
      }

      const res: AxiosResponse<ShelterResponse> = await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/shelter/${editShelter._id}`,
        formData,
        {
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success && res.data.shelter) {
        setShelters((prev) =>
          prev.map((s) =>
            s._id === editShelter._id ? (res.data.shelter as Shelter) : s
          )
        );

        toast.success("Shelter updated successfully");
        setShowModal(false);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to update shelter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  const filteredShelters = shelters.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const paginatedShelters = filteredShelters.slice(
    (currentPage - 1) * sheltersPerPage,
    currentPage * sheltersPerPage
  );

  const totalPages = Math.ceil(filteredShelters.length / sheltersPerPage);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
        >
          <ArrowLeftIcon /> Back
        </button>

        <h1 className="text-3xl font-semibold text-gray-800">Shelters</h1>

        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 text-sm whitespace-nowrap"
          >
            + Create Shelter
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedShelters.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <FrownIcon className="w-24 h-24 text-red-500 animate-pulse mx-auto mb-4 opacity-70" />
            <p className="text-lg text-red-600 animate-bounce font-semibold">
              No shelters found.
            </p>
          </div>
        ) : (
          paginatedShelters.map((shelter) => (
            <div
              key={shelter._id}
              className="flex flex-col md:flex-row gap-4 border border-gray-200 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              {/* Profile Image */}
              <img
                src={
                  shelter.profileImage?.startsWith("http")
                    ? shelter.profileImage
                    : shelter.profileImage
                    ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
                        shelter.profileImage
                      }`
                    : "img/profile-image.webp"
                }
                alt="shelter"
                className="w-20 h-20 rounded-full object-cover border shadow"
              />

              {/* Shelter Info */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {shelter.name}
                  </h2>

                  {/* Status Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <div
                      onClick={() =>
                        toggleActive(shelter._id, shelter.isActive)
                      }
                      className={`w-10 h-5 flex items-center rounded-full px-1 cursor-pointer transition-colors ${
                        shelter.isActive ? "bg-green-400" : "bg-red-400"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          shelter.isActive
                            ? "bg-green-800 ml-auto"
                            : "bg-red-700"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  📍 <span className="font-medium">Address:</span>{" "}
                  {shelter.address}
                </p>

                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    📞 <span className="font-medium">Phone:</span>{" "}
                    {shelter.phone}
                  </p>
                  {shelter.contactPerson && (
                    <p>
                      👤 <span className="font-medium">Contact:</span>{" "}
                      {shelter.contactPerson}
                    </p>
                  )}
                </div>

                <p className="text-sm">
                  🏠 <span className="font-medium">Occupancy:</span>
                  <span
                    className={`ml-1 font-semibold ${
                      Number(shelter.currentOccupancy) >=
                      Number(shelter.capacity)
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {shelter.currentOccupancy ?? "0"}/
                    {shelter.capacity || "N/A"}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-2 md:mt-0">
                <button
                  onClick={() => {
                    setEditShelter(shelter);
                    setShowModal(true);
                  }}
                  className="text-green-600 hover:text-green-800 transition"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => {
                    setShelterToDelete(shelter._id);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  <Trash2Icon size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && editShelter && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
            <div className="relative w-fit mx-auto mb-6">
              <img
                src={
                  typeof editShelter.profileImage !== "string" &&
                  editShelter.profileImage
                    ? URL.createObjectURL(editShelter.profileImage as File)
                    : typeof editShelter.profileImage === "string" &&
                      editShelter.profileImage.startsWith("http")
                    ? editShelter.profileImage
                    : editShelter.profileImage
                    ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
                        editShelter.profileImage
                      }`
                    : "img/profile-image.webp"
                }
                alt="Shelter Profile"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md"
              />

              <label
                htmlFor="profileImageUpload"
                className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 transition p-2 rounded-full shadow-md cursor-pointer"
                title="Change profile photo"
              >
                <input
                  id="profileImageUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditShelter({
                      ...editShelter,
                      profileImage: e.target.files?.[0]
                        ? URL.createObjectURL(e.target.files[0])
                        : undefined,
                    })
                  }
                  className="hidden"
                />
                <CameraIcon size={18} className="text-white" />
              </label>
            </div>

            <div className="space-y-3 text-left">
              <input
                type="text"
                value={editShelter.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditShelter({ ...editShelter, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Shelter Name"
              />
              <input
                type="text"
                value={editShelter.contactPerson || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditShelter({
                    ...editShelter,
                    contactPerson: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Contact Person"
              />
              <input
                type="text"
                value={editShelter.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditShelter({ ...editShelter, phone: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Phone"
              />
              <input
                type="text"
                value={editShelter.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditShelter({ ...editShelter, address: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Address"
              />
              <input
                type="number"
                value={editShelter.capacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditShelter({ ...editShelter, capacity: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Capacity"
              />
              <input
                type="number"
                value={editShelter.currentOccupancy || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditShelter({
                    ...editShelter,
                    currentOccupancy: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Current Occupancy"
              />
              <input
                type="email"
                value={editShelter.email}
                disabled
                className="w-full border px-3 py-2 rounded-md bg-gray-100 text-gray-500"
                placeholder="Email"
              />
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={updateDetails}
                disabled={loading}
                className={`px-6 py-2 rounded text-white transition ${
                  loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
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
                        d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 100 16v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Create Shelter</h2>
            <div className="relative mx-auto mb-4">
              <img
                src={
                  newShelter.profileImage instanceof File
                    ? URL.createObjectURL(newShelter.profileImage)
                    : "img/profile-image.webp"
                }
                alt="profileImage"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow"
              />
              <label
                htmlFor="newShelterProfile"
                className="absolute -bottom-2 right-[35%] bg-green-600 p-2 rounded-full cursor-pointer"
              >
                <input
                  id="newShelterProfile"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewShelter({
                      ...newShelter,
                      profileImage: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                />
                <CameraIcon size={18} className="text-white" />
              </label>
            </div>

            <div className="space-y-3 text-left">
              <input
                type="text"
                value={newShelter.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewShelter({ ...newShelter, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Shelter Name"
              />
              <input
                type="text"
                value={newShelter.contactPerson}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewShelter({
                    ...newShelter,
                    contactPerson: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Contact Person"
              />
              <input
                type="text"
                value={newShelter.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewShelter({ ...newShelter, phone: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Phone"
              />
              <input
                type="email"
                value={newShelter.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewShelter({ ...newShelter, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Email"
              />
              <input
                type="text"
                value={newShelter.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewShelter({ ...newShelter, address: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Address"
              />
              <input
                type="number"
                value={newShelter.capacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewShelter({ ...newShelter, capacity: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md"
                placeholder="Capacity"
              />
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={createShelter}
                disabled={cloading}
                className={`px-6 py-2 rounded text-white transition ${
                  cloading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {cloading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
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
                        d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 100 16v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Shelter"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this shelter?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setShelterToDelete(null);
                }}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded-full text-sm font-medium transition ${
              currentPage === i + 1
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SheltersDetails;
