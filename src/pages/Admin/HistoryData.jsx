import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const HistoryData = () => {
  const { authorizationToken } = useAuth();
  const [selectedSection, setSelectedSection] = useState("donations");

  const navigate = useNavigate();

  // State for donations
  const [donations, setDonations] = useState([]);
  const [displayDonations, setDisplayDonations] = useState([]);
  const [donationPage, setDonationPage] = useState(1);
  const [donationTotalPages, setDonationTotalPages] = useState(1);

  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [displayTasks, setDisplayTasks] = useState([]);
  const [taskPage, setTaskPage] = useState(1);
  const [taskTotalPages, setTaskTotalPages] = useState(1);

  // State for gaudaan
  const [gaudaan, setGaudaan] = useState([]);
  const [displayGaudaan, setDisplayGaudaan] = useState([]);
  const [gaudaanPage, setGaudaanPage] = useState(1);
  const [gaudaanTotalPages, setGaudaanTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const limit = 6; // Number of items per page per section

  // Fetch completed or cancelled donations, tasks, and gaudaan
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch donations
      const donationRes = await axios.get(`${import.meta.env.VITE_BACK_URL}/admin/history`, {
        headers: { Authorization: authorizationToken },
      });
      const completedDonations = (donationRes.data.donations || [])
        .filter((donation) => ["donated", "processed", "recycled", "cancelled"].includes(donation.status))
        .map((donation) => ({
          type: "donation",
          id: donation._id,
          title: `${donation.donor?.firstName}'s Donation`,
          address: `${donation.addressLine1}, ${donation.addressLine2}, ${donation.city}`,
          date: donation.pickupDate,
          status: donation.status,
          image: donation.donor?.profileImage
            ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.donor?.profileImage}`
            : "img/profile-image.webp",
          updatedAt: donation.updatedAt || donation.createdAt,
          route: `/pickups/${donation._id}`,
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setDonations(completedDonations);
      setDonationTotalPages(Math.ceil(completedDonations.length / limit));
      setDisplayDonations(completedDonations.slice(0, limit));
      setDonationPage(1);
      // Fetch tasks
      const taskRes = await axios.get(`${import.meta.env.VITE_BACK_URL}/admin/tasks`, {
        headers: { Authorization: authorizationToken },
      });
      const completedTasks = (taskRes.data.tasks || [])
        .filter((task) => ["completed", "cancelled"].includes(task.status))
        .map((task) => ({
          type: "task",
          id: task._id,
          title: task.taskTitle,
          details: `Type: ${task.taskType}, Volunteers: ${task.volunteer?.length > 0
            ? task.volunteer.map((vol) => vol.firstName || "Unknown").join(", ")
            : "Unassigned"
            }`,
          date: task.date,
          address: `${task.address}`,
          status: task.status,
          updatedAt: task.updatedAt || task.createdAt,
          route: `/tasks/${task._id}`,
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setTasks(completedTasks);
      setTaskTotalPages(Math.ceil(completedTasks.length / limit));
      setDisplayTasks(completedTasks.slice(0, limit));
      setTaskPage(1);

      // Fetch gaudaan
      const gaudaanRes = await axios.get(`${import.meta.env.VITE_BACK_URL}/admin/gaudaans`, {
        headers: { Authorization: authorizationToken },
      });
      const completedGaudaan = (gaudaanRes.data.data || [])
        .filter((completedGaudaan) => ["dropped", "rejected"].includes(completedGaudaan.status))
        .map((gaudaan) => ({
          type: "gaudaan",
          id: gaudaan._id,
          title: `${gaudaan.name}'s Gaudaan`,
          details: `Email: ${gaudaan.email}`,
          date: gaudaan.pickupDate,
          status: gaudaan.status,
          address: `${gaudaan.address}`,
          image: gaudaan.donor?.profileImage
            ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${gaudaan.donor?.profileImage}`
            : "img/profile-image.webp", updatedAt: gaudaan.updatedAt || gaudaan.createdAt,
          route: `/gaudaan/${gaudaan._id}`,
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setGaudaan(completedGaudaan);

      setGaudaanTotalPages(Math.ceil(completedGaudaan.length / limit));
      setDisplayGaudaan(completedGaudaan.slice(0, limit));
      setGaudaanPage(1);
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error("Failed to fetch history data");
    } finally {
      setLoading(false);
    }
  }, [authorizationToken, limit]);

  // Update displayed donations when page changes
  useEffect(() => {
    const start = (donationPage - 1) * limit;
    const end = start + limit;

    setDisplayDonations(donations.slice(start, end));
  }, [donationPage, donations, limit, donationTotalPages]);

  // Update displayed tasks when page changes
  useEffect(() => {
    const start = (taskPage - 1) * limit;
    const end = start + limit;

    setDisplayTasks(tasks.slice(start, end));
  }, [taskPage, tasks, limit, taskTotalPages]);

  // Update displayed gaudaan when page changes
  useEffect(() => {
    const start = (gaudaanPage - 1) * limit;
    const end = start + limit;

    setDisplayGaudaan(gaudaan.slice(start, end));
  }, [gaudaanPage, gaudaan, limit, gaudaanTotalPages]);

  // Initial data fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Pagination handlers
  const handlePreviousPage = (section) => {
    if (section === "donations" && donationPage > 1) {
      setDonationPage(donationPage - 1);
    } else if (section === "tasks" && taskPage > 1) {
      setTaskPage(taskPage - 1);
    } else if (section === "gaudaan" && gaudaanPage > 1) {
      setGaudaanPage(gaudaanPage - 1);
    }
  };

  const handleNextPage = (section) => {
    if (section === "donations" && donationPage < donationTotalPages) {
      setDonationPage(donationPage + 1);
    } else if (section === "tasks" && taskPage < taskTotalPages) {
      setTaskPage(taskPage + 1);
    } else if (section === "gaudaan" && gaudaanPage < gaudaanTotalPages) {
      setGaudaanPage(gaudaanPage + 1);
    }
  };

  // Render section
  const renderSection = (title, items, page, totalPages, sectionKey) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500 text-center" aria-live="polite">
          No completed or cancelled {sectionKey} found.
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(items) && items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="p-4 bg-white border rounded-xl shadow-sm space-y-2 hover:shadow-md transition"
                role="article"
              >
                <div className="flex items-center space-x-3">
                  {item?.image && (
                    <img
                      src={item.image}
                      alt={`${item.type} icon`}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none"; // Hide the image if it fails to load
                      }}
                    />
                  )}

                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.details}</p>
                    <p className="text-xs text-gray-500">
                      Address: {item.address}
                    </p>

                    <p className="text-xs text-gray-500">
                      Status: {item.status}
                    </p>
                    <p className="text-xs text-gray-400">
                      Date: {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => navigate(item.route)}
                  className="cursor-pointer flex items-center justify-end p-2 transition"
                >
                  <ChevronRight className="text-gray-500" />
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePreviousPage(sectionKey)}
              disabled={page === 1 || loading}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${page === 1 || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              aria-label={`Previous page for ${sectionKey}`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages} ({items.length} {sectionKey})
            </span>
            <button
              onClick={() => handleNextPage(sectionKey)}
              disabled={page === totalPages || loading}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${page === totalPages || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              aria-label={`Next page for ${sectionKey}`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    // <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
    //   <header className="flex justify-between items-center mb-6">
    //     <h1 className="text-2xl font-bold text-gray-800">History of Completed Items</h1>
    //   </header>

    //   {loading ? (
    //     <p className="text-center text-gray-600" aria-live="polite">
    //       Loading history...
    //     </p>
    //   ) : (
    //     <>
    //       {renderSection("Completed or Cancelled Donations", displayDonations, donationPage, donationTotalPages, "donations")}
    //       {renderSection("Completed or Cancelled Tasks", displayTasks, taskPage, taskTotalPages, "tasks")}
    //       {renderSection("Dropped or Rejected Gaudaan", displayGaudaan, gaudaanPage, gaudaanTotalPages, "gaudaan")}
    //     </>
    //   )}
    // </div>
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">History of Completed Items</h1>

        {/* Section Selector Tabs */}
        <div className="flex space-x-4">
          {["donations", "tasks", "gaudaan"].map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${selectedSection === section
                  ? "bg-green-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-100"
                }`}
            >
              {section === "donations"
                ? "Donations"
                : section === "tasks"
                  ? "Tasks"
                  : "Gaudaan"}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-dashed border-green-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading history...</span>
        </div>
      ) : (
        <>
          {selectedSection === "donations" &&
            renderSection(
              "Completed or Cancelled Donations",
              displayDonations,
              donationPage,
              donationTotalPages,
              "donations"
            )}

          {selectedSection === "tasks" &&
            renderSection(
              "Completed or Cancelled Tasks",
              displayTasks,
              taskPage,
              taskTotalPages,
              "tasks"
            )}

          {selectedSection === "gaudaan" &&
            renderSection(
              "Dropped or Rejected Gaudaan",
              displayGaudaan,
              gaudaanPage,
              gaudaanTotalPages,
              "gaudaan"
            )}
        </>
      )}
    </div>

  );
};

export default HistoryData;