import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GiCow } from "react-icons/gi";
import { useAuth } from "../../authContext/Auth";

const ITEMS_PER_PAGE = 4;

const GaudaanDetails = () => {
    const { authorizationToken } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDonations = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/gaudaan/user`, {
                    headers: {
                        Authorization: authorizationToken,
                    },
                });
                setDonations(res.data.data || []);
            } catch (err) {
                console.error("Error fetching user donations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserDonations();
    }, [authorizationToken]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-in", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const totalPages = Math.ceil(donations.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedDonations = donations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    if (loading) return <p className="text-center mt-8 text-green-600">Loading donations...</p>;

    return (
        <div className="max-w-6xl mx-auto mt-8 px-4">
            <div className="flex justify-between items-center mb-6">
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

            {donations.length > 0 ? (
                <>
                    <div className="grid md:grid-cols-2 gap-6">
                        {paginatedDonations.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white border border-green-200 shadow-lg rounded-xl p-5 hover:shadow-xl transition"
                            >
                                <h3 className="text-xl font-semibold text-green-800 mb-1">
                                    {item.animalType.replace(/\b\w/g, (char) => char.toUpperCase())}
                                </h3>
                                <p className="text-sm text-gray-600"><strong>Animal Type:</strong> {item.animalType}</p>
                                <p className="text-sm text-gray-600"><strong>Pickup Date:</strong> {formatDate(item.pickupDate)}</p>
                                <p className="text-sm text-gray-600"><strong>Pickup Time:</strong> {item.pickupTime}</p>
                                <p className="text-sm text-gray-600">
                                    <strong>Assigned Volunteer:</strong>{" "}
                                    {item.assignedVolunteer
                                        ? `${item.assignedVolunteer.firstName || item.assignedVolunteer.name || "N/A"} - ${item.assignedVolunteer.phone || item.assignedVolunteer.phoneNumber || "N/A"
                                        }`
                                        : "N/A"}
                                </p>
                                {item.images?.length > 0 && (
                                    <>
                                        <strong>Images:</strong>
                                        <div className="flex gap-2 mt-2">
                                            {item.images.map((img) => (
                                                <a
                                                    key={img.url}
                                                    href={`${import.meta.env.VITE_BACK_URL}/auth${img.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_BACK_URL}/auth${img.url}`}
                                                        alt="Donation image"
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <div className="mt-3">
                                    <p className="text-sm text-gray-700">
                                        <strong>Status:</strong>{" "}
                                        <span className={`font-medium ${item.status === "dropped" ? "text-green-600" : "text-yellow-600"}`}>
                                            {item.status?.replace("_", " ").toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                                {["shelter", "dropped"].includes(item.status) && item.shelterId && (
                                    <div className="mt-2 text-sm text-gray-700 border-t pt-2">
                                        <p><strong>Shelter Name:</strong> {item.shelterId.name || "N/A"}</p>
                                        <p><strong>Location:</strong> {item.shelterId.address || "N/A"}</p>
                                        <p><strong>Contact:</strong> {item.shelterId.phone || "N/A"}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center mt-8 gap-4">
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
                    <h3 className="text-xl font-semibold text-green-700 mb-1">No Donations Found</h3>
                    <p className="text-sm text-gray-500">This user has not submitted any Gaudaan donations yet.</p>
                </div>
            )}
        </div>
    );
};

export default GaudaanDetails;
