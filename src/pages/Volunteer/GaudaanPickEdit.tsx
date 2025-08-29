import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Define interfaces for type safety
interface Donor {
  name?: string;
}

interface StatusHistory {
  status: string;
}

interface Donation {
  _id: string;
  name?: string;
  animalType?: string;
  animalDescription?: string;
  pickupDate: string;
  pickupTime: string;
  address: string;
  status: string;
  statusHistory?: StatusHistory[];
  updatedAt: string;
}

interface Shelter {
  _id: string;
  name: string;
}

interface AuthContext {
  authorizationToken: string;
}

const GaudaanPickEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { authorizationToken } = useAuth() as AuthContext;
  const navigate = useNavigate();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedShelter, setSelectedShelter] = useState<string>("");

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      const [donationRes, shelterRes] = await Promise.all([
        axios.get<{ data: Donation }>(
          `${import.meta.env.VITE_BACK_URL}/auth/gaudaan/${id}`,
          {
            headers: { Authorization: authorizationToken },
          }
        ),
        axios.get<{ shelters: Shelter[] }>(
          `${import.meta.env.VITE_BACK_URL}/auth/shelters`,
          {
            headers: { Authorization: authorizationToken },
          }
        ),
      ]);

      setDonation(donationRes.data?.data || null);
      setShelters(shelterRes.data?.shelters || []);
    } catch (error: any) {
      toast.error(
        `Error fetching donation details: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [authorizationToken, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (): Promise<void> => {
    if (!selectedStatus) {
      toast.warning("Please select a status.");
      return;
    }
    if (selectedStatus === "dropped" && !selectedShelter) {
      toast.warning("Please select a shelter before updating.");
      return;
    }

    try {
      setUpdating(true);
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/auth/updateStatus/${donation?._id}`,
        {
          status: selectedStatus,
          shelterId: selectedShelter || null,
        },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Status updated!");
      await fetchData();
      setSelectedStatus("");
      setSelectedShelter("");
    } catch (error: any) {
      toast.error(
        `Status update failed: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setUpdating(false);
    }
  };

  const isPastDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickupDate = new Date(dateStr);
    return pickupDate.getTime() < today.getTime();
  };

  const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short", // outputs Aug instead of August
    year: "numeric",
  });
};

  if (loading)
    return (
      <p className="text-center mt-10 text-green-600">
        Loading donation details...
      </p>
    );
  if (!donation)
    return (
      <p className="text-center mt-10 text-gray-600">Donation not found</p>
    );

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold text-green-700 mb-6 bg-gradient-to-r from-green-100 to-white p-4 rounded-lg shadow-md">
        Donation by {donation.name || "Unknown"}
      </h2>

      <div className="mb-3 text-sm text-gray-700 space-y-1 max-h-24 overflow-hidden">
        <p>
          <strong>Animal Type:</strong> {donation.animalType || "Animal"}
        </p>
        <p>
          <strong>Description:</strong>{" "}
          {donation.animalDescription || "No description provided"}
        </p>
      </div>

      <p className="text-gray-600 mb-2 px-4 py-2 bg-gray-50 rounded-md shadow-sm">
        Pickup: {formatDate(donation.pickupDate)} at {donation.pickupTime}
      </p>
      <p className="text-gray-600 mb-4 px-4 py-2 bg-gray-50 rounded-md shadow-sm">
        Address: {donation.address}
      </p>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-lg px-4">
          Activity
        </h3>
        <ol className="list-none space-y-3 px-4">
          {donation.statusHistory?.map((history, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
            >
              <span className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <div>
                <span className="text-gray-700 font-medium">
                  {history.status.replace(/_/g, " ").toUpperCase()}
                </span>
                <p className="text-sm text-gray-500">
                  on:{" "}
                  {new Date(donation.updatedAt)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .replace(/ /g, "-")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="border rounded-lg p-5 bg-gray-50 shadow-md">
        {donation.status === "dropped" ? (
          <p className="text-red-600 text-sm font-medium">
            This donation has already been dropped. Status update is disabled.
          </p>
        ) : isPastDate(donation.pickupDate) ? (
          <p className="text-yellow-600 text-sm font-medium">
            Pickup date has passed. Status update is disabled.
          </p>
        ) : (
          <>
            <label className="block text-sm font-medium mb-3 text-gray-800">
              Update Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedStatus(e.target.value)
              }
              className="w-full border px-4 py-2 rounded-lg mb-4 focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select Status --</option>
              {["picked_up", "dropped", "rejected"]
                .filter((status) => {
                  if (status === donation.status) return false;
                  if (
                    ["picked_up", "shelter", "dropped"].includes(
                      donation.status
                    ) &&
                    status === "rejected"
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </option>
                ))}
            </select>

            {selectedStatus === "dropped" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Select Shelter
                </label>
                <select
                  value={selectedShelter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedShelter(e.target.value)
                  }
                  className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500"
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

            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 shadow-md disabled:bg-gray-400"
            >
              {updating ? "Updating..." : "Save"}
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200 shadow-md"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    </div>
  );
};

export default GaudaanPickEdit;
