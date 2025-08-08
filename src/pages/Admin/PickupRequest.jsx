import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../authContext/Auth';
import { useNavigate } from 'react-router-dom';

const PickupRequest = () => {
    const { authorizationToken } = useAuth();
    const [allDonations, setAllDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5; 
    const navigate = useNavigate();

    // Fetch donations
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/admin/activedonations`, {
                    headers: {
                        Authorization: authorizationToken,
                    },
                });
                const data = res.data.donations || [];
                setAllDonations(data);
                setTotalPages(Math.ceil(data.length / limit));
             
            } catch (err) {
                console.error('Error fetching pickups:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authorizationToken, limit]);

    
    const paginatedDonations = allDonations.slice(
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

    return (
        <div className="p-4 space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Request Donations Scrap</h2>

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
                            const img = donation?.donor?.profileImage
                                ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation?.donor?.profileImage}`
                                : 'img/profile-image.webp';
                            return (
                                <div
                                    key={donation._id}
                                    className="flex items-center justify-between p-3 bg-white rounded-xl shadow border"
                                >
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={img}
                                            alt="donor"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-800">{donation?.donor?.firstName}</p>
                                            <p className="text-xs text-gray-500 flex items-center space-x-1">
                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                                    <path d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z" />
                                                </svg>
                                                <span>{donation?.addressLine1}, {donation?.addressLine2}, {donation?.city}</span>
                                            </p>
                                            <p className="text-md text-blue-600">
                                              <span> Status: {donation.status}</span>
                                            </p>
                                            <p className="text-md text-gray-400">
                                                {new Date(donation.pickupDate).toLocaleDateString('en-IN')}
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
                            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPage === 1 || loading
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            aria-label="Previous page"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages} ({paginatedDonations.length} donations)
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

export default PickupRequest;