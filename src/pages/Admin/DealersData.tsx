import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ArrowLeftIcon, CameraIcon, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext/Auth";
import { useNavigate } from "react-router-dom";

// Define Dealer interface
interface Dealer {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  profileImage?: string | File;
  roles: string[];
  isActive: boolean;
}

const DealersData: React.FC = () => {
  const { authorizationToken } = useAuth();
  const [dealer, setDealers] = useState<Dealer[]>([]);
  const [query, setQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const DealersPerPage = 6;
  const [editDealer, setEditDealer] = useState<Dealer | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchDealers = useCallback(async () => {
    try {
      const res = await axios.get<{ dealer: Dealer[] }>(
        `${import.meta.env.VITE_BACK_URL}/admin/getdealers`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDealers(res.data.dealer);
    } catch (err) {
      console.error("Error fetching dealers:", err);
      toast.error("Failed to load dealers");
    }
  }, [authorizationToken]);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/dealer/${id}/active`,
        { isActive: !current },
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDealers((prev) =>
        prev.map((dealer) =>
          dealer._id === id ? { ...dealer, isActive: !current } : dealer
        )
      );
      toast.success(`Status updated: ${!current ? "Active" : "Inactive"}`);
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const deleteDealer = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACK_URL}/admin/dealer/${id}`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDealers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Dealer deleted");
    } catch {
      toast.error("Failed to delete dealer");
    }
  };

  const updateDetails = async () => {
    if (!editDealer) return;

    try {
      const formData = new FormData();
      formData.append("firstName", editDealer.firstName);
      formData.append("lastName", editDealer.lastName);
      formData.append("phone", editDealer.phone);

      if (editDealer.profileImage instanceof File) {
        formData.append("profileImage", editDealer.profileImage);
      }

      const res = await axios.patch<{ dealer: Dealer }>(
        `${import.meta.env.VITE_BACK_URL}/admin/dealer/${editDealer._id}`,
        formData,
        {
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setDealers((prev) =>
        prev.map((u) => (u._id === editDealer._id ? res.data.dealer : u))
      );
      toast.success("Dealer updated successfully");
      setShowModal(false);
    } catch (err) {
      console.error("Error updating dealer:", err);
      toast.error("Failed to update dealer");
    }
  };

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  // Reset currentPage to 1 when query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Filter the dealers based on the search query
  const filteredDealer = dealer.filter((u) => {
    const search = query.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(search) ||
      u.lastName?.toLowerCase().includes(search) ||
      u.phone?.includes(search)
    );
  });

  // Pagination logic applied to the filtered data
  const paginatedDealer = filteredDealer.slice(
    (currentPage - 1) * DealersPerPage,
    currentPage * DealersPerPage
  );

  const totalPages = Math.ceil(filteredDealer.length / DealersPerPage);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          className="w-6 h-8 text-sm font-medium hover:scale-105 hover:text-blue-600 text-gray-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-2xl font-bold">Dealers</h1>
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm w-1/2"
        />
      </div>

      <div className="space-y-4">
        {paginatedDealer.map((dealer) => (
          <div
            key={dealer._id}
            className="border rounded-md p-4 flex items-center gap-4 shadow-sm"
          >
            <img
              src={
                dealer.profileImage
                  ? typeof dealer.profileImage === "string" &&
                    dealer.profileImage.startsWith("http")
                    ? dealer.profileImage
                    : `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${dealer.profileImage}`
                  : "img/profile-image.webp"
              }
              alt="profileImage"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold">
                {dealer.firstName} {dealer.lastName}
              </p>
              <p className="text-sm text-gray-500">{dealer.phone}</p>
              <p className="text-green-600 text-sm font-medium mt-1">
                {dealer.roles.includes("dealer") && "Dealer"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-gray-700">
                  Status
                </span>
                <div
                  onClick={() => toggleActive(dealer._id, dealer.isActive)}
                  className={`w-10 h-5 flex items-center rounded-full px-1 cursor-pointer ${
                    dealer.isActive ? "bg-green-300" : "bg-red-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-all ${
                      dealer.isActive
                        ? "bg-green-700 ml-auto"
                        : "bg-red-600"
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="text-green-600 hover:text-green-800"
                onClick={() => {
                  setEditDealer(dealer);
                  setShowModal(true);
                }}
              >
                <Pencil size={20} />
              </button>

              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => deleteDealer(dealer._id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && editDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm relative text-center">
            <div className="relative mx-auto mb-4">
              <img
                src={
                  editDealer.profileImage instanceof File
                    ? URL.createObjectURL(editDealer.profileImage)
                    : typeof editDealer.profileImage === "string"
                    ? editDealer.profileImage.startsWith("http")
                      ? editDealer.profileImage
                      : `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${editDealer.profileImage}`
                    : "img/profile-image.webp"
                }
                alt="profileImage"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow"
              />

              <label
                htmlFor="profileImageUpload"
                className="absolute -bottom-2 right-[35%] bg-green-600 p-2 rounded-full cursor-pointer"
              >
                <input
                  id="profileImageUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files &&
                    setEditDealer({
                      ...editDealer,
                      profileImage: e.target.files[0],
                    })
                  }
                  className="hidden"
                />
                <CameraIcon size={18} className="text-white" />
              </label>
            </div>

            <div className="space-y-3 text-left">
              <div className="relative">
                <input
                  type="text"
                  value={editDealer.firstName}
                  onChange={(e) =>
                    setEditDealer({ ...editDealer, firstName: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md pl-10"
                  placeholder="First Name"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={editDealer.lastName}
                  onChange={(e) =>
                    setEditDealer({ ...editDealer, lastName: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md pl-10"
                  placeholder="Last Name"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={editDealer.phone}
                  onChange={(e) =>
                    setEditDealer({ ...editDealer, phone: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md pl-10"
                  placeholder="Phone"
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={editDealer.email}
                  disabled
                  className="w-full border px-3 py-2 rounded-md pl-10 bg-gray-100 text-gray-500"
                  placeholder="Email"
                />
              </div>
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
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {paginatedDealer.length === 0 && (
        <p className="text-center text-gray-400 text-sm">No dealers found.</p>
      )}

      <div className="mt-4 flex justify-center items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded-full text-sm font-medium ${
              currentPage === i + 1
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
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

export default DealersData;
