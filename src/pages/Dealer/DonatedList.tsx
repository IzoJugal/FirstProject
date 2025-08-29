import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";

// Define interfaces for type safety
interface Donor {
  profileImage?: string;
  firstName?: string;
}

interface Recycler {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ActivityLog {
  action: string;
  timestamp: string;
}

interface Donation {
  _id: string;
  scrapType: string;
  donor?: Donor;
  city?: string;
  pickupDate: string;
  recycler?: Recycler;
  addressLine1?: string;
  addressLine2?: string;
  weight?: string;
  activityLog?: ActivityLog[];
}

interface AuthContext {
  authorizationToken: string;
}

const DonatedList: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>("");
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewDetailsDonation, setViewDetailsDonation] =
    useState<Donation | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 5;

  const fetchDonated = useCallback(async (): Promise<void> => {
    try {
      const res = await axios.get<{ donations: Donation[] }>(
        `${import.meta.env.VITE_BACK_URL}/auth/donation/history`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDonations(res.data.donations || []);
      setCurrentPage(1); // Reset page on data refresh
    } catch (err) {
      console.error("Error fetching donated data:", err);
    }
  }, [authorizationToken]);

  const fetchRecyclers = useCallback(async (): Promise<void> => {
    try {
      const res = await axios.get<{ recyclers: Recycler[] }>(
        `${import.meta.env.VITE_BACK_URL}/auth/recyclers`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setRecyclers(res.data.recyclers || []);
    } catch (err) {
      console.error("Error fetching recyclers:", err);
    }
  }, [authorizationToken]);

  useEffect(() => {
    fetchDonated();
    fetchRecyclers();
  }, [authorizationToken, fetchDonated, fetchRecyclers]);

  const handleAssign = (donationId: string): void => {
    setSelectedDonationId(donationId);
    setSelectedRecyclerId("");
    setShowModal(true);
  };

  const handleConfirmAssign = async (): Promise<void> => {
    if (!selectedRecyclerId) {
      toast.warning("Please select Recycler!");
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_BACK_URL
        }/auth/${selectedDonationId}/assign-recycler`,
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

  const handleViewDetails = (donation: Donation): void => {
    setViewDetailsDonation(donation);
  };

  // Pagination calculations
  const totalPages: number = Math.ceil(donations.length / itemsPerPage);
  const startIndex: number = (currentPage - 1) * itemsPerPage;
  const currentDonations: Donation[] = donations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Pagination navigation handlers
  const goToPreviousPage = (): void => {
    setCurrentPage((page) => Math.max(page - 1, 1));
    window.scrollTo(0, 0);
  };

  const goToNextPage = (): void => {
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
          {/* Donation Cards */}
          <div className="space-y-4">
            {currentDonations.map((donation) => {
              const profileImage: string = donation.donor?.profileImage
                ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
                    donation.donor.profileImage
                  }`
                : "img/profile-image.webp";

              return (
                <div
                  key={donation._id}
                  className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-4 sm:flex-row sm:items-start"
                >
                  {/* Donor Image */}
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
                    <img
                      src={profileImage}
                      alt="Donor"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) =>
                        (e.currentTarget.src = "img/profile-image.webp")
                      }
                    />
                  </div>

                  {/* Donation Info */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-800">
                        {donation.scrapType}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {donation.donor?.firstName || "Unknown Donor"} —{" "}
                        {donation.city || "Unknown City"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Pickup Date: {new Date(donation.pickupDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Recycler or Action Button */}
                    {donation.recycler ? (
                      <button
                        onClick={() => handleViewDetails(donation)}
                        className="self-start bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition"
                      >
                        View Details
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssign(donation._id)}
                        className="self-start bg-green-600 text-white px-4 py-2 rounded-full text-sm hover:bg-green-700 transition"
                      >
                        Assign Recycler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-400 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-400 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Assign Recycler Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Assign Recycler</h2>
            <select
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={selectedRecyclerId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedRecyclerId(e.target.value)
              }
            >
              <option value="">Select Recycler</option>
              {recyclers.map((recycler) => (
                <option key={recycler._id} value={recycler._id}>
                  {recycler.firstName} {recycler.lastName} — {recycler.email}
                </option>
              ))}
            </select>
            <button
              onClick={handleConfirmAssign}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md w-full flex justify-center items-center gap-2 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
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

      {/* View Details Modal */}
      {viewDetailsDonation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setViewDetailsDonation(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Donation Details</h2>
            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <strong>Scrap Type:</strong> {viewDetailsDonation.scrapType}
              </p>
              <p>
                <strong>Pickup Date:</strong>{" "}
                {new Date(viewDetailsDonation.pickupDate).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
              <p>
                <strong>City:</strong> {viewDetailsDonation.city || "Unknown"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {viewDetailsDonation.addressLine1 || "N/A"}{" "}
                {viewDetailsDonation.addressLine2 || "N/A"}{" "}
              </p>
              <p>
                <strong>Weight:</strong> {viewDetailsDonation.weight || "N/A"}
              </p>
            </div>
            {viewDetailsDonation.activityLog?.length! > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
                <ul className="text-md text-gray-700 space-y-1 max-h-40 overflow-auto">
                  {viewDetailsDonation.activityLog!.map((log, idx) => (
                    <li key={idx}>
                      • <strong>{log.action}</strong>:- {"  "}
                      <span className="text-md text-gray-500">
                        {new Date(log.timestamp)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          .replace(/ /g, " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonatedList;
