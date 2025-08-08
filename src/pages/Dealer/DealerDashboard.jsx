import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, ChevronRight, User2, PackageSearch } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { GiHand } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const DealerDashboard = () => {
  const { user, authorizationToken } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-in", options);
    return formatted.replace(/ /g, "-");
  };

  const handleViewMoreUpcoming = () => {
    navigate("/pickupsdata");
  };

  const handleViewMoreHistory = () => {
    navigate("/historydata"); // or any other page you want
  };

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACK_URL}/auth/donations/dealer`,
          { headers: { Authorization: authorizationToken } }
        );
        setDonations(res.data.donations || []);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [authorizationToken]);

  const upcoming = donations.filter(
    (d) => d.status === "assigned" || d.status === "in-progress" || d.status === "picked-up"
  );
  const history = donations.filter(
    (d) => d.status === "donated" || d.status === "processed"
  );

  if (loading)
    return <p className="text-center mt-4 text-green-600">Loading...</p>;

  const renderDonationCard = (donation) => {
    const profileImage = donation.donor?.profileImage
      ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.donor?.profileImage}`
      : "img/profile-image.webp";

    return (
      <div
        key={donation._id}
        onClick={() => navigate(`/pickup/${donation._id}`)}
        className="cursor-pointer bg-gray-200 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition flex items-center gap-4"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") navigate(`/pickup/${donation._id}`);
        }}
      >
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
          <img
            src={profileImage}
            alt={`${donation.donor?.firstName} profile`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "img/profile-image.webp";
            }}
          />
        </div>
        <div className="flex-1">
          <h4 className="text-md font-semibold text-gray-800 mb-1">{donation.scrapType || "Pickup Item"}</h4>
          <p className="text-sm text-gray-600">
            Scheduled on {formatDate(donation.pickupDate)} at {donation.pickupTime}
          </p>
          <p className="text-xs text-gray-500 capitalize">Status: {donation.status}</p>
        </div>
        <ChevronRight className="text-gray-800" size={20} />
      </div>
    );
  };

  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700 flex items-center gap-2">
          <GiHand className="text-3xl text-amber-600 sm:text-4xl" />
          <span>Hi, {user?.name || "Dealer"}</span>
        </h2>

        {/* Overview Card */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <div className="bg-green-200 rounded-xl p-4 flex items-center gap-4 shadow">
            <PackageSearch className="text-green-700" size={32} />
            <div>
              <p className="text-xl font-bold text-green-700">{donations.length}</p>
              <p className="text-sm text-gray-600">Total Assigned Pickups</p>
            </div>
          </div>
        </div>

        {/* Upcoming Pickups */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Upcoming Pick-Ups</h3>
          <div className="space-y-3">
            {upcoming.slice(0,2).map(renderDonationCard)}
            {upcoming.length >2 && (
              <button
                className="w-full text-green-700 border border-green-600 rounded-xl py-2 mt-2 text-sm font-medium transition hover:bg-green-50"
                onClick={handleViewMoreUpcoming}
              >
                View More
              </button>
            )}
            {upcoming.length === 0 && (
              <p className="text-gray-500 text-center">No upcoming pickups.</p>
            )}
          </div>
        </div>

        {/* History Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2">History</h3>
          <div className="space-y-3">
            {history.slice(0, 2).map(renderDonationCard)}
            {history.length > 2 && (
              <button
                className="w-full text-green-700 border border-green-600 rounded-xl py-2 mt-2 text-sm font-medium transition hover:bg-green-50"
                onClick={handleViewMoreHistory}
              >
                View More
              </button>
            )}
            {history.length === 0 && (
              <p className="text-gray-500 text-center">No history yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DealerDashboard;
