import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext/Auth";
import { Loader2, ChevronRight, MapPin } from "lucide-react";

// Define interfaces for type safety
interface Donor {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export type DonationStatus = "assigned" | "processed" | "recycled";

interface Donation {
  _id: string;
  donor?: Donor;
  addressLine1: string;
  addressLine2: string;
  description: string;
  city: string;
  createdAt: string;
  status: DonationStatus;
  note?: string;
}

interface AuthContext {
  authorizationToken: string;
}

const GreenSortsData: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [note, setNote] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<{ [key: string]: string }>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  // Fetch donations
  const fetchDonations = useCallback(async (): Promise<void> => {
    try {
      const res = await axios.get<{ donations: Donation[] }>(
        `${import.meta.env.VITE_BACK_URL}/auth/recycler/assigned`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDonations(res.data.donations || []);
    } catch (err) {
      toast.error("Failed to fetch donations");
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  }, [authorizationToken]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Open modal for editing
  const openEditModal = (donation: Donation): void => {
    if (donation.status === "recycled") {
      toast.warning("Cannot edit past donations or recycled donations");
      return;
    }
    setEditingDonation(donation);
    setStatus((prev) => ({ ...prev, [donation._id]: donation.status }));
    setNote((prev) => ({ ...prev, [donation._id]: donation.note || "" }));
    setModalOpen(true);
  };

  // Update status for a single donation
  const handleUpdate = async (id: string): Promise<void> => {
    if (!status[id]) {
      toast.warning("Please select a status");
      return;
    }

    setLoadingId(id);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/auth/${id}/update-status`,
        {
          status: status[id],
          note: note[id] || "",
        },
        {
          headers: { Authorization: authorizationToken },
        }
      );
      toast.success("Status updated successfully");
      await fetchDonations();
      setNote((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setStatus((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setModalOpen(false);
      setEditingDonation(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  // Pagination logic
  const indexOfLastItem: number = currentPage * itemsPerPage;
  const indexOfFirstItem: number = indexOfLastItem - itemsPerPage;
  const currentDonations: Donation[] = donations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages: number = Math.ceil(donations.length / itemsPerPage);

  const handlePageChange = (pageNumber: number): void => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (pageLoading) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#579B52] mb-6">
        Assigned Scrap Donations
      </h1>

      {donations.length === 0 ? (
        <p className="text-gray-500">No donations assigned yet.</p>
      ) : (
        <>
          {currentDonations.map((donation) => {
            const isDisabled: boolean = donation.status === "recycled";
            const name: string = `${donation.donor?.firstName || "Unknown"} ${
              donation.donor?.lastName || ""
            }`;
            const location: string =
              [donation.addressLine1, donation.addressLine2, donation.city]
                .filter(Boolean)
                .join(", ") || "Unknown location";

            const date: string = new Date(
              donation.createdAt
            ).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={donation._id}
                onClick={() => openEditModal(donation)}
                className={`flex items-center justify-between bg-white shadow-md rounded-xl px-4 py-3 mb-4 cursor-pointer transition hover:shadow-lg ${
                  isDisabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mr-4">
                  {donation.donor?.imageUrl ? (
                    <img
                      src={donation.donor.imageUrl}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(ev: React.SyntheticEvent<HTMLImageElement>) =>
                        (ev.currentTarget.src = "/img/profile-image.webp")
                      }
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      {donation.donor?.firstName?.[0] || "U"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {name}
                  </h3>
                  <p className="text-sm text-green-600 truncate flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{location}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{date}</p>
                </div>

                {/* Chevron */}
                <div className="ml-3">
                  <ChevronRight className="text-gray-400" />
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Previous
            </button>
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-sm ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {/* Edit Modal */}
      {modalOpen && editingDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Donation</h2>

            {/* Donor Info */}
            <div className="flex items-center mb-4">
              {editingDonation.donor?.imageUrl ? (
                <img
                  src={editingDonation.donor.imageUrl}
                  alt="Donor Avatar"
                  className="w-12 h-12 rounded-full object-cover mr-3"
                  onError={(e) =>
                    (e.currentTarget.src = "/img/profile-image.webp")
                  }
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold mr-3">
                  {editingDonation.donor?.firstName?.[0] || "U"}
                </div>
              )}
              <div>
                <p className="font-semibold">{`${
                  editingDonation.donor?.firstName || "Unknown"
                } ${editingDonation.donor?.lastName || ""}`}</p>
                <p className="text-sm text-gray-500">
                  {new Date(editingDonation.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* Donation Details */}
            <div className="mb-4 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Address: </span>
                {[
                  editingDonation.addressLine1,
                  editingDonation.addressLine2,
                  editingDonation.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                <span className="font-medium">Description: </span>
                {editingDonation.description}
              </p>
             
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="border px-3 py-2 rounded-md text-sm w-full"
                  value={status[editingDonation._id] || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setStatus((prev) => ({
                      ...prev,
                      [editingDonation._id]: e.target.value,
                    }))
                  }
                  disabled={editingDonation.status === "recycled"}
                >
                  <option value="">Select status</option>
                  <option value="processed">Processed</option>
                  <option value="recycled">Recycled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-md text-sm w-full"
                  placeholder="Optional note"
                  value={note[editingDonation._id] || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNote((prev) => ({
                      ...prev,
                      [editingDonation._id]: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingDonation(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(editingDonation._id)}
                disabled={loadingId === editingDonation._id}
                className={`${
                  loadingId === editingDonation._id
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded-md text-sm flex items-center gap-2`}
              >
                {loadingId === editingDonation._id && (
                  <Loader2 className="animate-spin w-4 h-4" />
                )}
                {loadingId === editingDonation._id ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenSortsData;
