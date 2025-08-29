
import React, { useEffect, useState } from "react";
import { Loader2, Settings, CheckCircle, NotebookPen } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext/Auth";

// Define interfaces for type safety
interface User {
  name?: string;
}

interface AuthContext {
  authorizationToken: string;
  user?: User;
}

interface Donation {
  status: string;
  activityLog?: { action: string }[];
}

interface StatusCounts {
  assigned: number;
  processed: number;
  recycled: number;
}

interface DashboardItem {
  title: string;
  count: number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const GreenSortsDashboard: React.FC = () => {
  const { authorizationToken, user } = useAuth() as AuthContext;

  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    assigned: 0,
    processed: 0,
    recycled: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDonations = async (): Promise<void> => {
      try {
        const res = await axios.get<{ donations: Donation[] }>(
          `${import.meta.env.VITE_BACK_URL}/auth/recycler/assigned`,
          {
            headers: {
              Authorization: authorizationToken,
            },
          }
        );

        const donations = res.data.donations || [];

        const counts: StatusCounts = {
          assigned: donations.filter((d) =>
            d.activityLog?.some((log) => log.action === "assigned")
          ).length,
          processed: donations.filter((d) => d.status === "processed").length,
          recycled: donations.filter((d) => d.status === "recycled").length,
        };

        setStatusCounts(counts);
      } catch (error) {
        toast.error("Failed to fetch donation status counts.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [authorizationToken]);

  const dashboardItems: DashboardItem[] = [
    {
      title: "Assigned",
      count: statusCounts.assigned,
      icon: <NotebookPen className="w-8 h-8 text-white" />,
      description: "Donations assigned to you but not yet started.",
      color: "bg-blue-500",
    },
    {
      title: "In Progress",
      count: statusCounts.processed,
      icon: <Settings className="w-8 h-8 text-white" />,
      description: "Donations that are currently being processed.",
      color: "bg-yellow-500",
    },
    {
      title: "Completed",
      count: statusCounts.recycled,
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      description: "Donations that have been fully recycled.",
      color: "bg-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        <Loader2 className="animate-spin mr-2" /> Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 py-16 px-6">
      <h1 className="text-4xl font-extrabold text-center text-green-700 mb-10 tracking-tight">
        Welcome, {user?.name?.trim() || "Green Sorts User"} 👋
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`${item.color} rounded-full p-4`}>{item.icon}</div>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-1">
              {item.title}
            </h2>
            <p className="text-gray-500 text-center text-sm mb-2">{item.description}</p>
            <div className="text-center mt-4">
              <span className="text-4xl font-bold text-green-600">{item.count}</span>
              <p className="text-xs text-gray-400 uppercase mt-1">items</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GreenSortsDashboard;