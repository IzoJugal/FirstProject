import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { useNavigate } from "react-router-dom";

// Define interfaces for data structures
interface Donor {
  firstName?: string;
  profileImage?: string;
}

interface Donation {
  _id: string;
  donor?: Donor;
  addressLine1: string;
  addressLine2: string;
  city: string;
  scrapType: string;
  status: string;
  pickupDate: string;
}

interface AuthContext {
  authorizationToken: string;
}

const PickupRequest: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("");
  const limit: number = 5;
  const navigate = useNavigate();

  // Fetch donations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res: AxiosResponse<{ donations: Donation[] }> = await axios.get(
          `${import.meta.env.VITE_BACK_URL}/admin/activedonations`,
          {
            headers: {
              Authorization: authorizationToken,
            },
          }
        );
        const allowedStatuses = ["assigned", "pending", "picked-up", "unassigned"];
    const data = res.data.donations?.filter((donation) =>
      allowedStatuses.includes(donation.status)
    ) || [];
        setAllDonations(data);
        setFilteredDonations(data);
        setTotalPages(Math.ceil(data.length / limit));
      } catch (err) {
        console.error("Error fetching pickups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorizationToken, limit]);

  // Apply filters whenever statusFilter or cityFilter changes
  useEffect(() => {
    let filtered = allDonations;

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (donation) => donation.status === statusFilter
      );
    }

    // Filter by city
    if (cityFilter) {
      filtered = filtered.filter((donation) =>
        donation.city.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    setFilteredDonations(filtered);
    setTotalPages(Math.ceil(filtered.length / limit));
    setCurrentPage(1); // Reset to first page when filters change
  }, [statusFilter, cityFilter, allDonations, limit]);

  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle filter changes
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityFilter(e.target.value);
  };

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">
        Request Donations Scrap
      </h2>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Status Filter */}
        <div>
          <label
            htmlFor="statusFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="All">All</option>
            <option value="pending">Pending</option>
            <option value="picked-up">Picked Up</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label
            htmlFor="cityFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by City
          </label>
          <input
            id="cityFilter"
            type="text"
            value={cityFilter}
            onChange={handleCityChange}
            placeholder="Enter city name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600" aria-live="polite">
          Loading donations...
        </p>
      ) : paginatedDonations.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No active pickups.</p>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedDonations.map((donation) => {
              const img = donation.donor?.profileImage
                ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
                    donation.donor.profileImage
                  }`
                : "img/profile-image.webp";
              return (
                <div
                  key={donation._id}
                  className="flex items-center justify-between p-3 bg-white rounded-xl shadow border"
                >
                  <div className="flex items-center space-x-3">
                    {donation.donor?.profileImage ? (
                      <img
                        src={img}
                        alt={donation.donor?.firstName || "Donor"}
                        className="w-20 h-20 object-cover rounded-full"
                        onError={(e) =>
                          (e.currentTarget.src = "/img/profile-image.webp")
                        }
                      />
                    ) : (
                      <span className="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 text-green-700 text-lg font-bold">
                        {donation.donor?.firstName?.charAt(0) || "?"}
                      </span>
                    )}

                    <div>
                      <p className="font-medium text-gray-800">
                        {donation.donor?.firstName || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z" />
                        </svg>
                        <span>
                          {donation.addressLine1}, {donation.addressLine2},{" "}
                          {donation.city}
                        </span>
                      </p>
                      <p className="text-md text-blue-600">
                        <span>Scrap: {donation.scrapType}</span>
                      </p>
                      <p className="text-md text-blue-600">
                        <span>Status: {donation.status}</span>
                      </p>
                      <p className="text-md text-gray-400">
                        {new Date(donation.pickupDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate(`/pickups/${donation._id}`)}
                    className="cursor-pointer flex items-center justify-between p-3 transition"
                  >
                    <ChevronRight className="text-gray-500" />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentPage === 1 || loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} ({paginatedDonations.length}{" "}
              donations)
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                currentPage === totalPages || loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PickupRequest;
