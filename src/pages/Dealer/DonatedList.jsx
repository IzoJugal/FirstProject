import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";

export default function DonatedList() {
  const { authorizationToken } = useAuth();
  const [donations, setDonations] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState("");
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchDonated = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/donations/history`, {
        headers: { Authorization: authorizationToken },
      });
      setDonations(res.data.donations || []);
      setCurrentPage(1); // Reset page on data refresh
    } catch (err) {
      console.error("Error fetching donated data:", err);
    }
  }, [authorizationToken]);

  const fetchRecyclers = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/recyclers`, {
        headers: { Authorization: authorizationToken },
      });
      setRecyclers(res.data.recyclers || []);
    } catch (err) {
      console.error("Error fetching recyclers:", err);
    }
  }, [authorizationToken]);

  useEffect(() => {
    fetchDonated();
    fetchRecyclers();
  }, [authorizationToken, fetchDonated, fetchRecyclers]);

  const handleAssign = (donationId) => {
    setSelectedDonationId(donationId);
    setSelectedRecyclerId("");
    setShowModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedRecyclerId) {
      toast.warning("Please select Recycler!");
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/auth/${selectedDonationId}/assign-recycler`,
        { recyclerId: selectedRecyclerId },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Assigned successfully");
      setShowModal(false);
      await fetchDonated();
    } catch (error) {
      console.error("Error assigning recycler:", error);
      toast.error("Error assigning recycler");
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(donations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDonations = donations.slice(startIndex, startIndex + itemsPerPage);

  // Pagination navigation handlers
  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
    window.scrollTo(0, 0);
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-[90%] max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Donated Pickups</h1>

      {donations.length === 0 ? (
        <p className="text-gray-500">No donated pickups available.</p>
      ) : (
        <>
          <div className="space-y-4">
            {currentDonations.map((donation) => {
              const profileImage = donation.donor?.profileImage
                ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.donor.profileImage}`
                : "img/profile-image.webp";

              const formattedDate = new Date(donation.pickupDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).replace(/ /g, "-"); // e.g., 29-Jul-2025

              const latestActivity = donation.activityLog?.at(-1);

              return (
                <div
                  key={donation._id}
                  className="border rounded-xl p-4 shadow-sm bg-white mb-4 flex flex-col gap-4 sm:flex-row sm:items-start"
                >
                  {/* Profile Image */}
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
                    <img
                      src={profileImage}
                      alt={`${donation.donor?.firstName || "Donor"} profile`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "img/profile-image.webp";
                      }}
                    />
                  </div>

                  {/* Donation Details */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-800">{donation.scrapType}</h2>
                      <p className="text-sm text-gray-600">
                        {donation.donor?.firstName || "Unknown Donor"} — {donation.city || "Unknown City"}
                      </p>
                      <p className="text-sm text-gray-500">Pickup Date: {formattedDate}</p>
                    </div>

                    {/* Recycler Info or Assign Button */}
                    {donation.recycler ? (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm text-green-900">
                        <p><strong>Recycler:</strong> {donation.recycler.firstName} {donation.recycler.lastName}</p>
                        <p><strong>Email:</strong> {donation.recycler.email}</p>
                        {latestActivity && (
                          <>
                            <p><strong>Status:</strong> {latestActivity.action}</p>
                            {latestActivity.note && (
                              <p><strong>Note:</strong> {latestActivity.note}</p>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAssign(donation._id)}
                        className="self-start bg-green-600 text-white px-4 py-2 rounded-full text-sm hover:bg-green-700"
                      >
                        Assign Recycler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-4 py-2 bg-blue-400 text-white rounded disabled:opacity-50"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="flex items-center font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-blue-400 text-white rounded disabled:opacity-50"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Assign Recycler</h2>

            <select
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={selectedRecyclerId}
              onChange={(e) => setSelectedRecyclerId(e.target.value)}
            >
              <option value="">Select Recycler</option>
              {recyclers.map((recycler) => (
                <option key={recycler._id} value={recycler._id}>
                  {recycler.firstName} {recycler.lastName} — {recycler.email}
                </option>
              ))}
            </select>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md w-full flex justify-center items-center gap-2 hover:bg-green-700 disabled:opacity-50"
              onClick={handleConfirmAssign}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span>Assigning...</span>
                </>
              ) : (
                "Confirm Assign"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
