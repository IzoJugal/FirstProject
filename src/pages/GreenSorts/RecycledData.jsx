import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";

const RecycledData = () => {
  const { authorizationToken } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecycledDonations = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/recycle`, {
          headers: { Authorization: authorizationToken },
        });
        setDonations(res.data.donations || []);
      } catch (error) {
        toast.error("Failed to fetch recycled donations");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecycledDonations();
  }, [authorizationToken]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#579B52] mb-6">All Recycled Donations</h1>
      {donations.length === 0 ? (
        <p className="text-gray-600">No recycled donations found.</p>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <div
              key={donation._id}
              className="bg-white shadow-md rounded-xl p-5 border border-gray-200"
            >
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {donation.donor?.firstName} {donation.donor?.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  {donation.donor?.email} • {donation.donor?.phone}
                </p>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Scrap Type:</strong> {donation.scrapType}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Status:</strong> <span className="capitalize text-blue-600">{donation.status}</span>
              </p>
              <p className="text-sm text-gray-700">
                <strong>Last Note:</strong> {donation.activityLog?.[donation.activityLog.length - 1]?.note || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecycledData;
