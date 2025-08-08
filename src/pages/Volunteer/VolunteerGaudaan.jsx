import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 5;

const VolunteerGaudaan = () => {
  const { authorizationToken } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [shelterInputs, setShelterInputs] = useState({});
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const [donationRes, shelterRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACK_URL}/auth/assignedgaudaan`, {
          headers: { Authorization: authorizationToken },
        }),
        axios.get(`${import.meta.env.VITE_BACK_URL}/auth/shelters`, {
          headers: { Authorization: authorizationToken },
        }),
      ]);

      setDonations(donationRes.data?.assignedGaudaan || []);
      setShelters(shelterRes.data?.shelters || []);
    } catch (error) {
      toast.error("Error fetching data.", error);
    } finally {
      setLoading(false);
    }
  }, [authorizationToken]);

  useEffect(() => {
    fetchData();
  }, [authorizationToken, fetchData]);

  const handleStatusUpdate = async (id) => {
    const newStatus = selectedStatuses[id];
    const selectedShelter = shelterInputs[id];

    if (!newStatus || newStatus === "select") return;
    if ((newStatus === "shelter" || newStatus === "dropped") && !selectedShelter) {
      toast.warning("Please select a shelter before updating.");
      return;
    }

    try {
      setUpdatingId(id);

      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/auth/updateStatus/${id}`,
        {
          status: newStatus,
          shelterId: selectedShelter || null,
        },
        { headers: { Authorization: authorizationToken } }
      );

      toast.success("Status updated!");
      setEditingId(null);
      await fetchData();
    } catch (error) {
      toast.error("Status update failed.", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const isPastDate = (dateStr) => {
    const today = new Date();
    const pickupDate = new Date(dateStr);
    return pickupDate < today.setHours(0, 0, 0, 0);
  };

  

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
              const usedStatuses = new Set((item.statusHistory || []).map((s) => s.status));
              const isEditing = editingId === item._id;

              return (
                <div key={item._id} className="bg-white border border-green-300 shadow-md rounded-lg p-5">
                  <h3 className="text-lg font-semibold mb-1">
                    {item.donor?.firstName
                      ? `${item.donor.firstName} ${item.donor.lastName || ""} - ${item.donor?.phone}`
                      : "Donor"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">Animal: {item.animalType} is {item.animalCondition}</p>
                  <p className="text-sm text-gray-600 mb-1">Pickup: {item.pickupDate} at {item.pickupTime}</p>
                  <p className="text-sm text-gray-600 mb-1">Description: {item.animalDescription}</p>
                  <p className="text-sm text-gray-600 mb-2">Address: {item.address}</p>

                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Status:{" "}
                    <span
                      className={`${item.status === "unassigned"
                          ? "text-gray-500"
                          : item.status === "assigned"
                            ? "text-blue-600"
                            : item.status === "picked_up"
                              ? "text-purple-600"
                              : item.status === "shelter"
                                ? "text-orange-600"
                                : item.status === "dropped"
                                  ? "text-green-700"
                                  : item.status === "rejected"
                                    ? "text-red-600"
                                    : ""
                        }`}
                    >
                      {item.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </p>

                  {item.images?.length > 0 && (
                    <div className="mt-2">
                      <strong className="text-sm">Images:</strong>
                      <div className="flex gap-2 mt-2">
                        {item.images.map((img, i) => {
                          const url = typeof img === "string" ? img : img.url;
                          return (
                            <a
                              key={i}
                              href={`${import.meta.env.VITE_BACK_URL}/auth${url}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={`${import.meta.env.VITE_BACK_URL}/auth${url}`}
                                alt={`Image ${i + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Edit Mode */}
                  {isEditing ? (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                      <select
                        value={selectedStatuses[item._id] || "select"}
                        onChange={(e) =>
                          setSelectedStatuses((prev) => ({ ...prev, [item._id]: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3"
                      >
                        <option value="select">-- Select Status --</option>
                        {["picked_up", "dropped", "rejected"].map((status) => (
                          <option key={status} value={status} disabled={usedStatuses.has(status)}>
                            {status.replace("_", " ").toUpperCase()}
                          </option>
                        ))}
                      </select>

                      {selectedStatuses[item._id] === "dropped" && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Shelter
                          </label>
                          <select
                            value={shelterInputs[item._id] || ""}
                            onChange={(e) =>
                              setShelterInputs((prev) => ({
                                ...prev,
                                [item._id]: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          >
                            <option value="">-- Choose Shelter --</option>
                            {shelters.map((shelter) => (
                              <option key={shelter._id} value={shelter._id}>
                                {shelter.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusUpdate(item._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                          disabled={updatingId === item._id}
                        >
                          {updatingId === item._id ? "Updating..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      {isPastDate(item.pickupDate) ? (
                        <p className="text-sm text-gray-500 italic mt-2">Cannot edit past pickup date</p>
                      ) : (
                        <button
                          onClick={() => setEditingId(item._id)}
                          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
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
        </>
      ) : (
        <p className="text-gray-500 text-center">No assigned Gaudaan found.</p>
      )}
    </div>
  );
};

export default VolunteerGaudaan;
