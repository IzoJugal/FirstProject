import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, ChevronRight, User2, PackageSearch } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { GiHand } from "react-icons/gi"
import { useNavigate } from "react-router-dom";

// Define interfaces for type safety
interface Donor {
  profileImage?: string;
  firstName?: string;
}

interface Donation {
  _id: string;
  scrapType?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pickupDate: string;
  pickupTime: string;
  status: string;
  donor?: Donor;
}

interface User {
  name?: string;
}

interface AuthContext {
  user: User | null;
  authorizationToken: string;
}

const DealerDashboard: React.FC = () => {
  const { user, authorizationToken } = useAuth() as AuthContext;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-in", options);
    return formatted.replace(/ /g, " ");
  };
  
  const handleViewMoreUpcoming = (): void => {
    navigate("/pickupsdata");
  };

  const handleViewMoreHistory = (): void => {
    navigate("/historydata");
  };

  useEffect(() => {
    const fetchDonations = async (): Promise<void> => {
      try {
        const res = await axios.get<{ donations: Donation[] }>(
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

  const upcoming: Donation[] = donations.filter(
    (d) => d.status === "assigned" || d.status === "in-progress" || d.status === "picked-up"
  );
  const history: Donation[] = donations.filter(
    (d) => d.status === "donated" || d.status === "processed"
  );

  if (loading)
    return <p className="text-center mt-4 text-green-600">Loading...</p>;

  const renderDonationCard = (donation: Donation): React.ReactElement => {
    const profileImage: string = donation.donor?.profileImage
      ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.donor?.profileImage}`
      : "img/profile-image.webp";

    return (
      <div
        key={donation._id}
        onClick={() => navigate(`/pickup/${donation._id}`)}
        className="cursor-pointer bg-gray-200 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition flex items-center gap-4"
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") navigate(`/pickup/${donation._id}`);
        }}
      >
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
          <img
            src={profileImage}
            alt={`${donation.donor?.firstName || "Donor"} profile`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = "img/profile-image.webp";
            }}
          />
        </div>
        <div className="flex-1">
          <h4 className="text-md font-semibold text-gray-800 mb-1">{donation.scrapType || "Pickup Item"}</h4>
          <p className="flex items-start text-sm text-green-600 max-w-[200px]">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            {donation.addressLine1} {donation.addressLine2}, {donation.city}
          </p>
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
    <div className="p-4 sm:p-6">
      {/* Greeting */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-green-700 flex items-center gap-3">
        <GiHand className="text-amber-600 text-3xl sm:text-4xl animate-waving-hand" />
        <span>Hi, {user?.name || "Dealer"}</span>
      </h2>

      {/* Overview Card */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Overview</h3>
        <div className="bg-green-50 rounded-2xl p-5 flex items-center gap-5 shadow-md hover:shadow-lg transition">
          <PackageSearch className="text-green-700 flex-shrink-0" size={36} />
          <div>
            <p className="text-2xl font-bold text-green-700">{donations.length}</p>
            <p className="text-sm text-gray-600">Total Assigned Pickups</p>
          </div>
        </div>
      </div>

      {/* Upcoming Pickups */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Upcoming Pick-Ups</h3>
        <div className="space-y-4">
          {upcoming.slice(0, 2).map(renderDonationCard)}
          {upcoming.length > 2 && (
            <button
              className="w-full text-green-700 border border-green-600 rounded-xl py-2.5 text-sm font-medium transition hover:bg-green-100"
              onClick={handleViewMoreUpcoming}
            >
              View More
            </button>
          )}
          {upcoming.length === 0 && (
            <p className="text-gray-500 text-center py-3">No upcoming pickups.</p>
          )}
        </div>
      </div>

      {/* History Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">History</h3>
        <div className="space-y-4">
          {history.slice(0, 2).map(renderDonationCard)}
          {history.length > 2 && (
            <button
              className="w-full text-green-700 border border-green-600 rounded-xl py-2.5 text-sm font-medium transition hover:bg-green-100"
              onClick={handleViewMoreHistory}
            >
              View More
            </button>
          )}
          {history.length === 0 && (
            <p className="text-gray-500 text-center py-3">No history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;