import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CalendarDays, Clock, MapPin, Phone } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";

// ------------------ Types ------------------
interface Donor {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
}

interface Volunteer {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
}

interface StatusHistory {
  status: string;
  timestamp: string;
}

interface Gaudaan {
  _id: string;
  animalType: string;
  animalDescription?: string;
  pickupDate?: string;
  pickupTime?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  statusHistory: StatusHistory[];
  donor?: Donor;
  assignedVolunteer?: Volunteer;
  images?: { url: string }[];
  address?: string;
  name?: string;
}

interface VolunteerResponse {
  volunteers: Volunteer[];
}

// ------------------ Component ------------------
const GaudaanById: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authorizationToken } = useAuth();
  const [gaudaan, setGaudaan] = useState<Gaudaan | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Fetch Gaudaan by ID
  useEffect(() => {
    const fetchGaudaan = async () => {
      try {
        const res = await axios.get<{ gaudaan: Gaudaan }>(
          `${import.meta.env.VITE_BACK_URL}/admin/gaudaan/${id}`,
          {
            headers: { Authorization: authorizationToken },
          }
        );
        setGaudaan(res.data.gaudaan);
      } catch (err) {
        console.error("Failed to fetch gaudaan:", err);
        toast.error("Failed to fetch gaudaan data");
      }
    };

    if (authorizationToken) {
      fetchGaudaan();
    } else {
      navigate("/login");
    }
  }, [id, authorizationToken, navigate]);

  // Fetch Volunteers
  const fetchVolunteers = async () => {
    try {
      const res = await axios.get<VolunteerResponse>(
        `${import.meta.env.VITE_BACK_URL}/admin/volunteers`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setVolunteers(res.data.volunteers || []);
    } catch (err) {
      console.error("Failed to fetch volunteers:", err);
      toast.error("Failed to fetch volunteers");
    }
  };

  const handleAccept = () => {
    fetchVolunteers();
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!gaudaan) return;
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/assignVolunteer/${gaudaan._id}`,
        { volunteerId: selectedVolunteer, notes },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Volunteer assigned successfully!");
      navigate("/gaudaan");
    } catch (err: any) {
      console.error("Error assigning volunteer:", err);
      toast.error(err?.response?.data?.message || "Assignment failed");
    }
  };

  const handleReject = async () => {
    if (!gaudaan) return;
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/reject/${gaudaan._id}`,
        { reason: "Rejected by admin" },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Gaudaan rejected.");
      navigate("/gaudaan");
    } catch (err) {
      console.error("Error rejecting gaudaan:", err);
      toast.error("Rejection failed");
    }
  };

  if (!gaudaan) return <div className="text-center py-10">Loading...</div>;

  // ------------------ Helpers ------------------
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short", // 👉 outputs Aug instead of August
      year: "numeric",
    });
  };

  // Build status timeline
  const statusList: { label: string; date: string; status: string }[] = [];
  if (gaudaan.status === "shelter" || gaudaan.status === "dropped") {
    statusList.push({
      label: "Assigned",
      date:
        gaudaan.statusHistory.find((h) => h.status === "assigned")?.timestamp ||
        gaudaan.createdAt,
      status: "assigned",
    });
    statusList.push({
      label: "Picked up",
      date:
        gaudaan.statusHistory.find((h) => h.status === "picked_up")
          ?.timestamp || gaudaan.updatedAt,
      status: "picked_up",
    });
    statusList.push({
      label: "Donated",
      date:
        gaudaan.statusHistory.find(
          (h) => h.status === "shelter" || h.status === "dropped"
        )?.timestamp || gaudaan.updatedAt,
      status: "donated",
    });
  } else if (gaudaan.status === "picked_up") {
    statusList.push({
      label: "Assigned",
      date:
        gaudaan.statusHistory.find((h) => h.status === "assigned")?.timestamp ||
        gaudaan.createdAt,
      status: "assigned",
    });
    statusList.push({
      label: "Picked up",
      date:
        gaudaan.statusHistory.find((h) => h.status === "picked_up")
          ?.timestamp || gaudaan.updatedAt,
      status: "picked_up",
    });
  } else if (gaudaan.status === "assigned") {
    statusList.push({
      label: "Assigned",
      date:
        gaudaan.statusHistory.find((h) => h.status === "assigned")?.timestamp ||
        gaudaan.updatedAt,
      status: "assigned",
    });
  } else if (gaudaan.status === "rejected") {
    statusList.push({
      label: "Rejected",
      date:
        gaudaan.statusHistory.find((h) => h.status === "rejected")?.timestamp ||
        gaudaan.updatedAt,
      status: "rejected",
    });
  }

  // Fallback images
  const profileImg = gaudaan.donor?.profileImage
    ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
        gaudaan.donor.profileImage
      }`
    : "/img/profile-img.webp";

  const volunteerImg = gaudaan.assignedVolunteer?.profileImage
    ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
        gaudaan.assignedVolunteer?.profileImage
      }`
    : "/img/profile-img.webp";

  const fullAddress = gaudaan.address || "N/A";

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      {gaudaan.images && gaudaan.images.length > 0 && (
        <img
          src={`${import.meta.env.VITE_BACK_URL}/auth${gaudaan.images[0]?.url}`}
          alt="Gaudaan"
          className="w-full h-52 object-cover rounded-xl shadow-md"
        />
      )}

      <h2 className="text-2xl font-bold text-gray-800">
        {gaudaan.animalType} Gaudaan
      </h2>

      <div>
        <h3 className="text-lg font-semibold text-gray-700">Description</h3>
        <p className="mt-1 text-gray-600 p-3 bg-gray-50 rounded-lg border">
          {gaudaan.animalDescription || "No description provided"}
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-700">Schedule Pickup</h3>
        <div className="flex items-center gap-4 text-gray-600 mt-1">
          <Clock size={20} /> {gaudaan.pickupTime || "N/A"}
          <CalendarDays size={20} className="ml-4" />
          {formatDate(gaudaan.pickupDate || gaudaan.createdAt)}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-700">Donor Details</h3>
        <div className="bg-white shadow rounded-lg p-3 flex items-center gap-4">
          <img
            src={profileImg || "/default-avatar.png"}
            alt="Donor Profile"
            className="h-16  w-16  rounded-full object-cover border border-gray-300 shadow-sm bg-gray-100"
          />

          <div>
            <p className="font-semibold">
              {gaudaan.donor?.firstName && gaudaan.donor?.lastName
                ? `${gaudaan.donor.firstName} ${gaudaan.donor.lastName}`
                : gaudaan.name}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone size={14} /> +91 {gaudaan.donor?.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">Location</h3>
        <p className="flex items-center text-gray-600">
          <MapPin size={18} className="mr-1" /> {fullAddress}
        </p>
      </div>

      {gaudaan.assignedVolunteer && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Assigned Volunteer
          </h3>
          <div className="bg-white shadow rounded-lg p-3 flex items-center gap-4 my-2">
            <img
              src={volunteerImg}
              alt="Volunteer"
              className="h-12 w-12 rounded-full object-cover border"
            />
            <div>
              <p className="font-semibold">
                {gaudaan.assignedVolunteer.firstName}{" "}
                {gaudaan.assignedVolunteer.lastName}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Phone size={14} /> +91 {gaudaan.assignedVolunteer.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Activity</h3>
        {/* <ol className="relative border-l-2 border-green-300 ml-4 space-y-6"> */}
        <ol className="relative border-l-2 border-dashed border-green-600 ml-4 space-y-6">
          {statusList.length > 0 ? (
            statusList.map((step, idx) => {
              const isCurrent = step.label
                .toLowerCase()
                .includes(gaudaan.status.replace(/_/g, " "));
              return (
                <li key={idx} className="ml-4 relative">
                  <div
                    className={`absolute -left-7 flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold
                                 ${
                                   isCurrent
                                     ? "bg-green-600 text-white"
                                     : "bg-green-500 text-white"
                                 }`}
                  >
                    {idx + 1}
                  </div>
                  <div className={isCurrent ? "bg-blue-50 p-1 rounded-md" : ""}>
                    <p
                      className={`text-base font-semibold ${
                        step.status === "rejected"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="text-sm text-gray-600">
                      {formatDate(step.date)}
                    </p>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="ml-4 text-gray-500 italic">No activity yet.</li>
          )}
        </ol>
      </div>

      {gaudaan.status === "unassigned" && (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-700">Action</h3>
          <div className="flex justify-center gap-4 pt-4">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-md shadow hover:bg-green-700 transition"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded-md shadow hover:bg-red-600 transition"
              onClick={() => setShowRejectConfirm(true)}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Assign Volunteer</h3>
            <select
              className="w-full border p-2 rounded mb-4"
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
            >
              <option value="">Select a Volunteer</option>
              {volunteers
                .filter((v) => v._id !== gaudaan?.donor?._id)
                .map((volunteer) => (
                  <option key={volunteer._id} value={volunteer._id}>
                    {volunteer.firstName} {volunteer.lastName}
                  </option>
                ))}
            </select>
            <textarea
              rows={3}
              className="w-full border p-2 rounded mb-4"
              placeholder="Optional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleAssign}
                disabled={!selectedVolunteer}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to reject this gaudaan?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowRejectConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-lg text-blue-700 bg-gray-300 rounded-2xl p-3 font-semibold"
        >
          <ArrowLeft className="mr-1" size={24} />
          Back
        </button>
      </div>
    </div>
  );
};

export default GaudaanById;
