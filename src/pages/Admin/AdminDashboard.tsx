/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Users,
  PackageSearch,
  IndianRupee,
  Weight,
  Truck,
  UserCheck,
  LucidePawPrint,
  PawPrint,
  HeartHandshake,
  Handshake,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";

// Define types for useAuth hook
interface AuthContextType {
  authorizationToken: string | null;
  isAuthenticated?: boolean;
  logout?: () => void;
  user?: { _id?: string; roles?: string[] } | null;
}

// Define types for stats state
interface Stats {
  totalPickups?: number;
  totalScrapKg?: number;
  donationValue?: number;
  users?: number;
  dealers?: number;
  volunteers?: number;
  shelters?: number;
  logo?: string;
}

// Define types for request user data
interface RequestUser {
  donor?: {
    firstName?: string;
    profileImage?: string;
  };
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  createdAt?: string;
}

// Define props for StatCard
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}

// Define props for RequestCard
interface RequestCardProps {
  user: RequestUser;
  handleClick: (id: string) => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between p-4 m-2 shadow-gray-400 bg-white rounded-2xl shadow-lg hover:scale-105">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-green-600">{value}</p>
    </div>
    <div className="bg-green-100 rounded-full p-3">
      <Icon className="h-6 w-6 text-green-600" />
    </div>
  </div>
);

const RequestCard: React.FC<RequestCardProps> = ({ user, handleClick }) => {
  const baseUrl = import.meta.env.VITE_BACK_URL;
  const donorImage = user?.donor?.profileImage;
  const imageUrl = donorImage
    ? donorImage.startsWith("http")
      ? donorImage
      : `${baseUrl}/auth/profile/image/${donorImage.replace(/^\/+/, "")}`
    : "/img/profile-img.webp";
  const donorName = user?.donor?.firstName || "Unknown";
  const address = `${user.addressLine1}${
    user.addressLine2 ? ", " + user.addressLine2 : ""
  }, ${user.city}`;
  const date = new Date(user?.createdAt ?? "").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      onClick={() => handleClick && handleClick((user as any)?._id)}
      className="flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm"
    >
      <div className="flex items-center space-x-3">
        <img
          src={imageUrl}
          alt={donorName}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-800">{donorName}</p>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <MapPin size={18} className="mt-[2px] text-gray-600" />
            <span>{address}</span>
          </div>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition">
        <ChevronRight size={18} className="text-gray-500" />
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContextType;
  const [stats, setStats] = useState<Stats>({});
  const [recentRequests, setRecentRequests] = useState<RequestUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    navigate(`/pickups/${id}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: authorizationToken || "" },
        };

        const [
          pickupsRes,
          scrapedRes,
          donationValueRes,
          usersRes,
          dealersRes,
          volunteersRes,
          recentRequestsRes,
          sheltersRes,
          logoRes,
        ] = await Promise.all([
          axios.get<{ totalDonations: number }>(
            `${import.meta.env.VITE_BACK_URL}/admin/totalpickups`,
            config
          ),
          axios.get<{ totalWeight: number }>(
            `${import.meta.env.VITE_BACK_URL}/admin/totalscraped`,
            config
          ),
          axios.get<{ totalValue: number }>(
            `${import.meta.env.VITE_BACK_URL}/admin/totaldonationValue`,
            config
          ),
          axios.get<{ totalActiveUsers: number }>(
            `${import.meta.env.VITE_BACK_URL}/admin/activeUsers`,
            config
          ),
          axios.get<{ totalActiveDealers: number }>(
            `${import.meta.env.VITE_BACK_URL}/admin/activeDealers`,
            config
          ),
          axios.get<{ totalActiveUsers: number }>(
            `${import.meta.env.VITE_BACK_URL}/admin/activeVolunteers`,
            config
          ),
          axios.get<{ donations: RequestUser[] }>(
            `${import.meta.env.VITE_BACK_URL}/admin/pendingDonation`,
            config
          ),
          axios.get<{ count: number }>(
            `${import.meta.env.VITE_BACK_URL}/admin/shelters`,
            config
          ),
          axios.get<{ data: { url?: string } }>(
            `${import.meta.env.VITE_BACK_URL}/admin/logos`,
            config
          ),
        ]);

        setStats({
          totalPickups: pickupsRes.data.totalDonations || 0,
          totalScrapKg: scrapedRes.data.totalWeight || 0,
          donationValue: donationValueRes.data.totalValue || 0,
          users: usersRes.data.totalActiveUsers || 0,
          dealers: dealersRes.data.totalActiveDealers || 0,
          volunteers: volunteersRes.data.totalActiveUsers || 0,
          shelters: sheltersRes.data.count || 0,
          logo: logoRes.data.data?.url,
        });

        setRecentRequests(recentRequestsRes.data.donations || []);
      } catch (error: unknown) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authorizationToken]);

  const handleChangeLogoClick = () => {
    navigate("/logoupload");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <BeatLoader color="#23b31c" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <button
          onClick={handleChangeLogoClick}
          className="px-6 py-2 text-black hover:text-blue-500 font-semibold rounded-md transition duration-300"
        >
          Change Logo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/history">
          <StatCard
            icon={Truck}
            label="Total Pickups"
            value={stats.totalPickups || "..."}
          />
        </Link>

        <StatCard
          icon={Weight}
          label="Scrap Collected (Kg)"
          value={stats.totalScrapKg || "..."}
        />
        <StatCard
          icon={IndianRupee}
          label="Donation Value (₹)"
          value={stats.donationValue || "..."}
        />

        <Link to="/users">
          <StatCard
            icon={Users}
            label="Active Users"
            value={stats.users || "..."}
          />
        </Link>

        <Link to="/volunteers">
          <StatCard
            icon={Handshake}
            label="Active Volunteers"
            value={stats.volunteers || "..."}
          />
        </Link>

        <Link to="/dealers">
          <StatCard
            icon={UserCheck}
            label="Active Dealers"
            value={stats.dealers || "..."}
          />
        </Link>

        <Link to="/shelters">
          <StatCard
            icon={PawPrint}
            label="Shelters"
            value={stats.shelters || "..."}
          />
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mt-6">
        Recent Scrap Requests
      </h2>

      <div className="space-y-3">
        {Array.isArray(recentRequests) &&
          recentRequests
            .slice(0, 3)
            .map((user, index) => (
              <RequestCard key={index} user={user} handleClick={handleClick} />
            ))}

        <button
          onClick={() => {
            navigate("/pickupRequest");
          }}
          className="w-full mt-3 text-green-700 font-semibold py-2 border border-green-600 rounded-xl hover:bg-green-50"
        >
          View More
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
