import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext/Auth";
import { Loader2 } from "lucide-react";

const GreenSortsDashboard = () => {
  const { authorizationToken } = useAuth();
  const [donations, setDonations] = useState([]);
  const [note, setNote] = useState({});
  const [status, setStatus] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch donations
  const fetchDonations = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/recycler/assigned`, {
        headers: { Authorization: authorizationToken },
      });
      setDonations(res.data.donations || []);
    } catch (err) {
      toast.error("Failed to fetch donations", err);
    } finally {
      setPageLoading(false);
    }
  }, [authorizationToken]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Update status for a single donation
  const handleUpdate = async (id) => {
    if (!status[id]) {
      toast.warning("Please select a status");
      return;
    }

    setLoadingId(id);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/auth/${id}/update-status`,
        {
          status: status[id],
          note: note[id] || "",
        },
        {
          headers: { Authorization: authorizationToken },
        }
      );
      toast.success("Status updated successfully");
      await fetchDonations();
      setNote((prev) => {
        const updated = { ...prev };
        delete updated[id]; // clear note for this donation
        return updated;
      });

      setStatus((prev) => {
        const updated = { ...prev };
        delete updated[id]; // clear status for this donation
        return updated;
      });

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  if (pageLoading) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#579B52] mb-6">Assigned Scrap Donations</h1>

      {donations.length === 0 ? (
        <p className="text-gray-500">No donations assigned yet.</p>
      ) : (
        donations.map((donation) => {
          const latestLog = donation.activityLog?.at(-1);

          return (
            <div
              key={donation._id}
              className="bg-white shadow rounded-xl p-5 mb-4 border border-gray-200"
            >
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {donation.donor?.firstName || "Unknown"} {donation.donor?.lastName || ""}
                </h2>
                <p className="text-sm text-gray-500">
                  {donation.donor?.email || "No email"} • {donation.donor?.phone || "No phone"}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  <strong>Scrap Type:</strong> {donation.scrapType}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  <strong>Dealer:</strong> {donation.dealer?.firstName || "N/A"}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  <strong>Current Status:</strong>{" "}
                  <span className="text-blue-600">{latestLog?.action || donation.status}</span>
                </p>
                {latestLog?.note && (
                  <p className="mt-1 text-sm text-gray-700">
                    <strong>Note:</strong> <span className="text-blue-600">{latestLog.note}</span>
                  </p>
                )}
              </div>

              {donation.status !== "recycled" && (
                <div className="flex flex-col md:flex-row gap-3 md:items-center mt-2">
                  <select
                    className="border px-3 py-2 rounded-md text-sm"
                    value={status[donation._id] || ""}
                    onChange={(e) =>
                      setStatus((prev) => ({ ...prev, [donation._id]: e.target.value }))
                    }
                  >
                    <option value="">Select status</option>
                    <option value="processed">Processed</option>
                    <option value="recycled">Recycled</option>
                  </select>

                  <input
                    type="text"
                    className="border px-3 py-2 rounded-md text-sm flex-1"
                    placeholder="Optional note"
                    value={note[donation._id] || ""}
                    onChange={(e) =>
                      setNote((prev) => ({ ...prev, [donation._id]: e.target.value }))
                    }
                  />

                  <button
                    onClick={() => handleUpdate(donation._id)}
                    disabled={loadingId === donation._id}
                    className={`${loadingId === donation._id
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                      } text-white px-4 py-2 rounded-md text-sm transition flex items-center gap-2`}
                  >
                    {loadingId === donation._id && (
                      <Loader2 className="animate-spin w-4 h-4" />
                    )}
                    {loadingId === donation._id ? "Updating..." : "Update"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GreenSortsDashboard;
