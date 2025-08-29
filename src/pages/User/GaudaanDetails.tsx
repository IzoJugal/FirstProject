import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GiCow } from "react-icons/gi";
import { useAuth } from "../../authContext/Auth";
import { MapPin } from "lucide-react";

// ----- Types -----
interface Image {
  url: string;
}

interface Donation {
  _id: string;
  animalType?: string;
  animalDescription?: string;
  address?: string;
  pickupDate?: string;
  status: Status;
  images?: Image[];
}

type Status = "all" | "dropped" | "rejected" | "assigned" | "unassigned";

const ITEMS_PER_PAGE = 4;

// ----- Component -----
const GaudaanDetails: React.FC = () => {
  const { authorizationToken } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<Status>("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDonations = async () => {
      try {
        const res = await axios.get<{ data: Donation[] }>(
          `${import.meta.env.VITE_BACK_URL}/auth/gaudaan/user`,
          {
            headers: {
              Authorization: authorizationToken,
            },
          }
        );
        setDonations(res.data.data || []);
      } catch (err) {
        console.error("Error fetching user donations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDonations();
  }, [authorizationToken]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleCardClick = (id: string) => {
    navigate(`/gaudaan/${id}`);
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "Unknown Date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-in", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filter donations based on statusFilter
  const filteredDonations: Donation[] =
    statusFilter === "all"
      ? donations
      : donations.filter((donation) => donation.status === statusFilter);

  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDonations = filteredDonations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const chunkText = (text?: string, chunkSize = 25): string => {
    if (!text) return "No note provided";
    return text.match(new RegExp(`.{1,${chunkSize}}`, "g"))?.join("\n") || "";
  };

  if (loading)
    return <p className="text-center mt-8 text-green-600">Loading donations...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-green-700 flex items-center gap-2 mb-6">
          <GiCow className="text-black" size={36} />
          Gaudaan Donations by User
        </h2>
        <button
          onClick={() => navigate("/create-gaudaan")}
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
        >
          + Create Gaudaan
        </button>
      </div>

      {/* Status Filter Dropdown */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="statusFilter" className="font-medium text-gray-700">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value as Status)
          }
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All</option>
          <option value="dropped">Dropped</option>
          <option value="rejected">Rejected</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {filteredDonations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedDonations.map((item) => (
              <div
                key={item._id}
                className="bg-white flex items-start gap-4 p-4 rounded-xl shadow border hover:shadow-md transition cursor-pointer"
                onClick={() => handleCardClick(item._id)}
              >
                <div className="flex items-start gap-4 rounded-xl p-4 w-full sm:max-w-none max-w-md flex-col sm:flex-row">
                  <img
                    src={
                      item.images?.[0]
                        ? `${import.meta.env.VITE_BACK_URL}/auth${item.images[0].url}`
                        : "https://via.placeholder.com/80"
                    }
                    alt="Donation"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {item.animalType
                        ? item.animalType.charAt(0).toUpperCase() +
                          item.animalType.slice(1)
                        : "Donation"}
                    </h3>
                    <p className="text-sm text-green-700 font-medium flex items-center gap-1">
                      <MapPin size={16} />
                      {item.address || "Unknown Location"}
                    </p>

                    <p className="text-sm text-gray-600 whitespace-pre-line break-words max-h-24 overflow-hidden">
                      {chunkText(item.animalDescription)}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          item.status === "dropped"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status?.replace("_", " ").toUpperCase()}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatDate(item.pickupDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center items-center mt-8 gap-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-green-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-blue-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-600 py-10">
          <h3 className="text-xl font-semibold text-green-700 mb-1">
            No Donations Found
          </h3>
          <p className="text-sm text-gray-500">
            This user has not submitted any Gaudaan donations yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default GaudaanDetails;