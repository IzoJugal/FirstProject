import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";
import { ChevronRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define interfaces for type safety
interface Donor {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

interface Donation {
  _id: string;
  donor?: Donor;
  address: string;
  status: keyof typeof statusConfig;
  pickupDate: string;
  pickupTime?: string;
}

interface AuthContext {
  authorizationToken: string;
}

const ITEMS_PER_PAGE = 5;

const statusConfig = {
  unassigned: { label: "Unassigned", color: "text-gray-400" },
  assigned: { label: "Assigned", color: "text-blue-500" },
  picked_up: { label: "Picked Up", color: "text-green-500" },
  shelter: { label: "At Shelter", color: "text-purple-500" },
  dropped: { label: "Dropped", color: "text-yellow-500" },
  rejected: { label: "Rejected", color: "text-red-500" },
} as const;

const VolunteerGaudaan: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      const [donationRes] = await Promise.all([
        axios.get<{ assignedGaudaan: Donation[] }>(
          `${import.meta.env.VITE_BACK_URL}/auth/assignedgaudaan`,
          {
            headers: { Authorization: authorizationToken },
          }
        ),
        axios.get(`${import.meta.env.VITE_BACK_URL}/auth/shelters`, {
          headers: { Authorization: authorizationToken },
        }),
      ]);

      setDonations(donationRes.data?.assignedGaudaan || []);
    } catch (error: any) {
      toast.error(`Error fetching data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [authorizationToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pagination
  const totalPages = Math.ceil(donations.length / ITEMS_PER_PAGE);
  const paginatedDonations = donations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) return <p className="text-center mt-10 text-green-600">Loading assigned donations...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Assigned Gaudaan</h2>

      {donations.length ? (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedDonations.map((item) => {
              const profileImage = item.donor?.profileImage
                ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${item.donor.profileImage}`
                : "/img/profile-image.webp";

              return (
                <div
                  key={item._id}
                  onClick={() => navigate(`/gaudaanPick/${item._id}`)}
                  className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border transition border-gray-300"
                >
                  {/* Left Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-green-200 flex items-center justify-center flex-shrink-0">
                    {item.donor?.profileImage ? (
                      <img
                        src={profileImage}
                        alt={item.donor?.firstName || "Donor"}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/img/profile-image.webp")}
                      />
                    ) : (
                      <span className="text-lg font-bold text-green-700">
                        {item.donor?.firstName?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>

                  {/* Middle Info */}
                  <div className="flex-1 ml-4">
                    <h4 className="text-md font-semibold text-gray-800">
                      {item.donor?.firstName || "Unknown"} {item.donor?.lastName || ""}
                    </h4>
                    <p className="flex items-start text-sm text-green-600 max-w-[200px]">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{item.address}</span>
                    </p>
                    <p
                      className={`text-md px-2 py-1 rounded-full ${
                        statusConfig[item.status]?.color || "bg-gray-300 text-black"
                      }`}
                    >
                      {statusConfig[item.status]?.label || item.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.pickupDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {item.pickupTime && ` at ${item.pickupTime}`}
                    </p>
                  </div>

                  {/* Right Chevron */}
                  <ChevronRight className="text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center">No assigned Gaudaan found.</p>
      )}
    </div>
  );
};

export default VolunteerGaudaan;