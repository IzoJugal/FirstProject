import React, { useEffect, useState, useCallback, memo } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight, CornerRightDown } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// InputField component (reused from TaskDetails.jsx)
const InputField = memo(
    ({ label, field, type = "text", required = false, value, onChange, error }) => (
        <div className="flex flex-col">
            <label htmlFor={field} className="block text-sm font-medium mb-1 text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={field}
                name={field}
                type={type}
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${error ? "border-red-500" : "border-gray-300"
                    }`}
                placeholder={`Enter ${label}`}
                aria-required={required}
                aria-invalid={!!error}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    )
);

// StatusSelect component (reused from TaskDetails.jsx)
const StatusSelect = memo(({ value, onChange, error }) => (
    <div className="flex flex-col">
        <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700">
            Status <span className="text-red-500">*</span>
        </label>
        <select
            id="status"
            name="status"
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${error ? "border-red-500" : "border-gray-300"
                }`}
            aria-required="true"
            aria-invalid={!!error}
        >
            <option value="pending">Pending</option>
            <option value="dropped">Dropped</option>
            <option value="rejected">Rejected</option>
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
));

const GaudaanData = () => {
    const { authorizationToken } = useAuth();
    const navigate = useNavigate();
    const [allGaudaan, setAllGaudaan] = useState([]);
    const [displayGaudaan, setDisplayGaudaan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6; // Number of items per page

    // Fetch all gaudaan
    const fetchGaudaan = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/admin/gaudaan`, {
                headers: { Authorization: authorizationToken },
            });
            const gaudaan = (response.data.data || []).sort(
                (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
            );
            setAllGaudaan(gaudaan);
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

    // Update displayed gaudaan when page changes
    useEffect(() => {
        const start = (currentPage - 1) * limit;
        const end = start + limit;

        setDisplayGaudaan(allGaudaan.slice(start, end));
    }, [currentPage, allGaudaan, limit, totalPages]);

    // Initial data fetch
    useEffect(() => {
        fetchGaudaan();
    }, [fetchGaudaan]);


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

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gaudaan Data</h1>
            </header>

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
                                onClick={() => navigate(`/gaudaan/${gaudaan._id}`)}
                                key={gaudaan._id}
                                className="p-4 bg-white border rounded-xl shadow-sm space-y-2 hover:shadow-md transition"
                                role="article"
                            >
                                <CornerRightDown />
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-blue-700">{gaudaan.animalType}'s Gaudaan</h2>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-blue-700"> Donor: {gaudaan.name}</h4>
                                </div>

                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Status:</span> {gaudaan.status}
                                </p>

                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Pickup Address:</span> {gaudaan.address}
                                </p>
                                <p className="text-gray-600">
                                    {new Date(gaudaan.createdAt).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1 || loading}
                            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPage === 1 || loading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            aria-label="Previous page"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages} ({displayGaudaan.length} gaudaan)
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || loading}
                            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPage === totalPages || loading
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