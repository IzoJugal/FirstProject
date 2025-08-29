import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import {
  CalendarDays,
  Clock,
  Phone,
  Weight,
  IndianRupee,
  MapPin,
  Home,
  X,
  ArrowLeft,
  PhoneCall,
} from "lucide-react";
import { toast } from "react-toastify";

const Images: string[] = ["/img/img1.jpg", "/img/img2.jpg", "/img/img2.jpg"];

const statusLabels: { [key: string]: string } = {
  assigned: "Assigned",
  "picked-up": "Pick up on",
  donated: "Donated",
};

// Define interfaces for type safety
interface Donor {
  profileImage?: string;
  firstName?: string;
  lastName?: string;
}

interface ActivityLog {
  action: string;
  timestamp: string;
}

export type DonationStatus = "pending" | "assigned" | "donated" | "picked-up";

interface Donation {
  _id: string;
  scrapType?: string;
  description?: string;
  pickupTime: string;
  pickupDate: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  country: string;
  donor?: Donor;
  price?: number;
  weight?: number;
  notes?: string;
  status: DonationStatus;
  activityLog?: ActivityLog[];
}

interface AuthContext {
  authorizationToken: string;
}

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  status: string;
  setStatus: (status: string) => void;
  donation: Donation;
}

interface ScrapEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  weight: string;
  setWeight: (weight: string) => void;
  price: string;
  setPrice: (price: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  status,
  setStatus,
  donation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-md rounded-xl p-5 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-red-600 hover:text-red-800"
        >
          <X />
        </button>
        <h2 className="text-lg font-semibold mb-4">Update Status</h2>

        <select
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setStatus(e.target.value)
          }
        >
          <option value="">Select Status</option>
          <option
            value="picked-up"
            disabled={
              donation.status === "picked-up" ||
              donation.status === "donated" ||
              donation.activityLog?.some((log) => log.action === "picked-up")
            }
          >
            Picked Up
          </option>
        </select>

        <button
          onClick={onSave}
          className="mt-4 w-full bg-green-600 text-white rounded-full py-2 font-medium hover:bg-green-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ScrapEditModal: React.FC<ScrapEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  weight,
  setWeight,
  price,
  setPrice,
  notes,
  setNotes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600 hover:text-red-800"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Scrap Details</h2>

        <input
          type="number"
          placeholder="Scrap Price (₹)"
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          value={price}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPrice(e.target.value)
          }
          required
        />

        <input
          type="number"
          placeholder="Scrap Weight (kg)"
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          value={weight}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setWeight(e.target.value)
          }
          required
        />

        <textarea
          placeholder="Notes (required)"
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNotes(e.target.value)
          }
          required
        />

        <button
          onClick={onSave}
          disabled={!price || !weight || !notes}
          className={`mt-2 w-full rounded-full py-2 font-medium transition ${
            !price || !weight || !notes
              ? "bg-green-300 text-gray-600 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
};

const PickupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { authorizationToken } = useAuth() as AuthContext;
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);
  const [isSavingScrapDetails, setIsSavingScrapDetails] =
    useState<boolean>(false);
  const navigate = useNavigate();

  // Separate state for each modal
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showScrapEditModal, setShowScrapEditModal] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % Images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (i: number): void => setIndex(i);

  useEffect(() => {
    async function fetchDonation(): Promise<void> {
      try {
        const res = await axios.get<{ donation: Donation }>(
          `${import.meta.env.VITE_BACK_URL}/auth/donation/${id}`,
          {
            headers: { Authorization: authorizationToken },
          }
        );
        setDonation(res.data.donation);
        setPrice(res.data.donation.price?.toString() || "");
        setWeight(res.data.donation.weight?.toString() || "");
        setNotes(res.data.donation.notes || "");
      } catch (error) {
        console.error("Failed to fetch donation", error);
        toast.error("Failed to fetch donation details");
      } finally {
        setLoading(false);
      }
    }

    fetchDonation();
  }, [authorizationToken, id]);

  const handleSaveScrapDetails = async (): Promise<void> => {
    if (!price || !weight || !notes) {
      toast.error("Please provide price, weight, and notes");
      return;
    }

    try {
      setIsSavingScrapDetails(true);
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/auth/donations/${
          donation?._id
        }/update`,
        { price: Number(price), weight: Number(weight), notes },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Scrap details updated!");
      setShowScrapEditModal(false);

      const updated = await axios.get<{ donation: Donation }>(
        `${import.meta.env.VITE_BACK_URL}/auth/donation/${id}`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDonation(updated.data.donation);
    } catch (error) {
      console.error("Failed to update scrap details", error);
      toast.error("Failed to update scrap details.");
    } finally {
      setIsSavingScrapDetails(false);
    }
  };

  const handleSaveStatus = async (): Promise<void> => {
    if (!selectedStatus) {
      toast.warning("Please select a status before saving.");
      return;
    }

    if (!donation?.price || !donation?.weight || !donation?.notes) {
      toast.error(
        "Please update scrap price, weight, and notes before changing status."
      );
      return;
    }

    try {
      setIsSavingStatus(true);
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/auth/donation/${
          donation?._id
        }/status`,
        {
          status: selectedStatus,
          price: Number(donation.price),
          weight: Number(donation.weight),
          notes: donation.notes,
        },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success(`Status updated to ${selectedStatus}!`);
      setShowStatusModal(false);
      setSelectedStatus("");

      const updated = await axios.get<{ donation: Donation }>(
        `${import.meta.env.VITE_BACK_URL}/auth/donation/${id}`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDonation(updated.data.donation);
    } catch (error) {
      console.error("Error updating status", error);
      toast.error("Failed to update status");
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!donation)
    return (
      <div className="text-center py-20 text-red-500">Donation not found.</div>
    );

  const orderedStatuses: string[] = ["assigned", "picked-up", "donated"];
  const filteredActivity: ActivityLog[] = orderedStatuses
    .map((status) => donation.activityLog?.find((act) => act.action === status))
    .filter((act): act is ActivityLog => Boolean(act));

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <section>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {children}
    </section>
  );

  const PrimaryButton: React.FC<{
    label: string;
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
  }> = ({ label, onClick, disabled, isLoading }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`mt-3 w-full text-sm border rounded-full py-2 font-medium transition flex items-center justify-center gap-2 ${
        disabled || isLoading
          ? "text-gray-600 bg-gray-300 cursor-not-allowed"
          : "text-blue-700 bg-green-300"
      }`}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-gray-800"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      )}
      {isLoading ? "Processing..." : label}
    </button>
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-gray-800">
      {/* Image carousel */}
      <div className="w-full rounded-2xl overflow-hidden shadow aspect-video relative">
        <img
          src={Images[index]}
          alt="Slide"
          className="w-full min-h-min object-cover transition duration-700"
        />
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {Images.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-3 h-3 rounded-full border ${
                i === index ? "bg-green-600" : "bg-white"
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Scrap Type */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
        Donate {donation.scrapType || "Untitled Donation"}
      </h2>

      {/* Description */}
      <Section title="Description">
        <p className="text-sm text-gray-700 leading-relaxed">
          {donation.description}
        </p>
      </Section>

      {/* Pickup Schedule */}
      <Section title="Schedule Pickup">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border text-sm">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{donation.pickupTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            <span>
              {(() => {
                const date = new Date(donation.pickupDate);
                const day = String(date.getDate()).padStart(2, "0");
                const month = date.toLocaleString("en-IN", { month: "short" });
                const year = date.getFullYear();
                return `${day} ${month} ${year}`;
              })()}
            </span>
          </div>
        </div>
      </Section>

      {/* Pickup Address */}
      <Section title="Pickup Address">
        <div className="text-sm bg-gray-50 p-4 rounded-xl space-y-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${donation.city}, ${donation.pincode}, ${donation.country}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            <div className="flex gap-2 items-start">
              <Home size={16} className="mt-1" />
              <span>
                {donation.addressLine1}, {donation.addressLine2}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <MapPin size={16} />
              {donation.city}, {donation.pincode}, {donation.country}
            </div>
          </a>
        </div>
      </Section>

      {/* Donor Details */}
      <Section title="Donor Details">
        <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col sm:flex-row items-center sm:items-start gap-6 text-sm">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500 shadow-md flex-shrink-0">
            <img
              src={`${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
                donation.donor?.profileImage || ""
              }`}
              alt="Donor Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center sm:text-left space-y-1">
            <p className="text-base font-semibold text-gray-800">
              {donation.donor?.firstName} {donation.donor?.lastName}
            </p>
            <p className="text-xs text-gray-600 flex items-center justify-center sm:justify-start gap-2">
              <MapPin size={14} className="text-green-600" />
              <span>
                {donation.addressLine1}, {donation.addressLine2}
              </span>
            </p>
            <p className="text-xs text-gray-600 flex items-center justify-center sm:justify-start gap-2">
              <Phone size={14} className="text-green-600" />
              <span>{import.meta.env.VITE_ORG_CONTACT}</span>
            </p>
          </div>
        </div>
      </Section>

      {/* Activity */}
      <Section title="Activity">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          {filteredActivity.length > 0 ? (
            <ol className="relative border-l border-dashed border-green-300 pl-6 ml-3 space-y-6">
              {orderedStatuses.map((statusKey, i) => {
                const activity = donation.activityLog?.find(
                  (act) => act.action === statusKey
                );
                const isDone = Boolean(activity);

                return (
                  <li key={statusKey} className="relative">
                    <div
                      className={`absolute w-6 h-6 flex items-center justify-center rounded-full -left-3 text-xs font-semibold ${
                        isDone
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="ml-4">
                      <p
                        className={`text-sm font-semibold ${
                          isDone ? "text-blue-900" : "text-gray-400"
                        }`}
                      >
                        {statusLabels[statusKey] || statusKey}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity
                          ? new Date(activity.timestamp).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "00/month/0000"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-gray-500 text-sm">No activity recorded yet.</p>
          )}
        </div>

        <PrimaryButton
          label="Change Status"
          disabled={
            donation.status !== "donated" ||
            donation.price === undefined ||
            donation.weight === undefined ||
            donation.notes === undefined
          }
          onClick={() => setShowStatusModal(true)}
          isLoading={isSavingStatus}
        />
      </Section>

      {donation.status === "assigned" && (
        <Section title="Scrap Weight & Pricing">
          <div className="bg-white border rounded-xl p-4 space-y-2 text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <IndianRupee size={14} />
              <span className="font-semibold">{donation.price || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight size={14} />
              <span className="font-semibold">{donation.weight || 0} kg</span>
            </div>
            <div>
              <span className="font-semibold">Notes: </span>
              <span>{donation.notes || "N/A"}</span>
            </div>
          </div>

          <PrimaryButton
            label="Edit Details"
            disabled={!!donation.price && !!donation.weight}
            onClick={() => {
              setPrice(donation.price?.toString() || "");
              setWeight(donation.weight?.toString() || "");
              setNotes(donation.notes || "");
              setShowScrapEditModal(true);
            }}
            isLoading={isSavingScrapDetails}
          />
        </Section>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 bg-gray-300 p-2 rounded-2xl font-medium hover:text-green-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <StatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSave={handleSaveStatus}
        status={selectedStatus}
        setStatus={setSelectedStatus}
        donation={donation}
      />

      <ScrapEditModal
        isOpen={showScrapEditModal}
        onClose={() => setShowScrapEditModal(false)}
        onSave={handleSaveScrapDetails}
        weight={weight}
        setWeight={setWeight}
        price={price}
        setPrice={setPrice}
        notes={notes}
        setNotes={setNotes}
      />
    </div>
  );
};

export default PickupDetail;