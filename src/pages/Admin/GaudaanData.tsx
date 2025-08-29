import React, {
  useEffect,
  useState,
  useCallback,
  memo,
  ChangeEvent,
} from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronRight,
  CornerRightDown,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Define type for gaudaan object
interface Gaudaan {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // allow extra fields
}

// InputField component
interface InputFieldProps {
  label: string;
  field: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const InputField = memo(
  ({
    label,
    field,
    type = "text",
    required = false,
    value,
    onChange,
    error,
  }: InputFieldProps) => (
    <div className="flex flex-col">
      <label
        htmlFor={field}
        className="block text-sm font-medium mb-1 text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={field}
        name={field}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={`Enter ${label}`}
        aria-required={required}
        aria-invalid={!!error}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
);

// StatusSelect component
interface StatusSelectProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

const StatusSelect = memo(({ value, onChange, error }: StatusSelectProps) => (
  <div className="flex flex-col">
    <label
      htmlFor="status"
      className="block text-sm font-medium mb-1 text-gray-700"
    >
      Status <span className="text-red-500">*</span>
    </label>
    <select
      id="status"
      name="status"
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      aria-required="true"
      aria-invalid={!!error}
    >
      <option value="">All</option>
      <option value="pending">Pending</option>
      <option value="assigned">Assigned</option>
      <option value="picked_up">Picked up</option>
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

const GaudaanData: React.FC = () => {
  const { authorizationToken } = useAuth();
  const navigate = useNavigate();
  const [allGaudaan, setAllGaudaan] = useState<Gaudaan[]>([]);
  const [filteredGaudaan, setFilteredGaudaan] = useState<Gaudaan[]>([]);
  const [displayGaudaan, setDisplayGaudaan] = useState<Gaudaan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const limit = 6; // items per page

  // Fetch gaudaan
  const fetchGaudaan = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ data: Gaudaan[] }>(
        `${import.meta.env.VITE_BACK_URL}/admin/gaudaan`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      const gaudaan = (response.data.data || []).sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
      setAllGaudaan(gaudaan);
      setFilteredGaudaan(gaudaan); // Initialize filteredGaudaan with all data
      setTotalPages(Math.ceil(gaudaan.length / limit));
      setDisplayGaudaan(gaudaan.slice(0, limit));
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching gaudaan:", err);
      toast.error("Failed to fetch gaudaan data");
    } finally {
      setLoading(false);
    }
  }, [authorizationToken, limit]);

  // Handle status filter change
  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value;
    setStatusFilter(selectedStatus);
    setCurrentPage(1); // Reset to first page when filter changes

    // Filter gaudaan based on status
    const filtered = selectedStatus
      ? allGaudaan.filter((gaudaan) => gaudaan.status === selectedStatus)
      : allGaudaan;
    setFilteredGaudaan(filtered);
    setTotalPages(Math.ceil(filtered.length / limit));
    setDisplayGaudaan(filtered.slice(0, limit));
  };

  // Update displayed gaudaan on page or filter change
  useEffect(() => {
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    setDisplayGaudaan(filteredGaudaan.slice(start, end));
  }, [currentPage, filteredGaudaan, limit]);

  // Initial fetch
  useEffect(() => {
    fetchGaudaan();
  }, [fetchGaudaan]);

  // Pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleNavigate = (id: string) => {
    navigate(`/gaudaans/${id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gaudaan Data</h1>
      </header>

      {/* Status Filter */}
      <div className="mb-6">
        <StatusSelect
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600" aria-live="polite">
          Loading gaudaan...
        </p>
      ) : displayGaudaan.length === 0 ? (
        <p className="text-gray-500 text-center" aria-live="polite">
          No gaudaan records found.
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayGaudaan.map((gaudaan) => (
              <div
                onClick={() => handleNavigate(gaudaan._id)}
                key={gaudaan._id}
                className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                role="article"
              >
                {/* Left side: Avatar + Details */}
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  {gaudaan?.donor?.profileImage ? (
                    <img
                      src={`${
                        import.meta.env.VITE_BACK_URL
                      }/auth/profile/image/${gaudaan.donor.profileImage}`}
                      alt={`${gaudaan.donor.firstName} ${gaudaan.donor.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : gaudaan.imageUrl ? (
                    <img
                      src={gaudaan.imageUrl}
                      alt={gaudaan.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {gaudaan.donor?.firstName?.charAt(0) ||
                        gaudaan.name?.charAt(0) ||
                        "?"}
                    </div>
                  )}

                  {/* Donor Details */}
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {gaudaan.name}
                    </h2>
                    <h2 className="font-semibold text-gray-800">
                      Animal:- {gaudaan.animalType}
                    </h2>
                    <p className="flex items-start text-sm text-green-600 max-w-[200px]">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{gaudaan.address}</span>
                    </p>
                    <p className="text-purple-600">
                      Status:-{" "}
                      {gaudaan.status[0].toUpperCase() +
                        gaudaan.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(gaudaan.pickupDate).toLocaleDateString(
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

                {/* Right Chevron */}
                <ChevronRight className="text-gray-800 w-5 h-5 flex-shrink-0" />
              </div>
            ))}
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
              Page {currentPage} of {totalPages} ({displayGaudaan.length}{" "}
              gaudaan)
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

export default GaudaanData;
