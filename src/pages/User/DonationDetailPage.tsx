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
  Mail,
} from "lucide-react";

// Interfaces for data structures
interface Dealer {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

interface ActivityLog {
  action: string;
  timestamp: string;
}

interface Donation {
  _id: string;
  scrapType?: string;
  description?: string;
  pickupTime?: string;
  pickupDate?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  country?: string;
  dealer?: Dealer;
  status?: string;
  activityLog?: ActivityLog[];
  price?: number;
  weight?: number;
}

// Props for StatusModal
interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  status: string;
  setStatus: (status: string) => void;
  note: string;
  setNote: (note: string) => void;
  donation: Donation;
}

// Props for ScrapEditModal
interface ScrapEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  weight: string;
  setWeight: (weight: string) => void;
  price: string;
  setPrice: (price: string) => void;
  note: string;
  setNote: (note: string) => void;
}

// Status labels
const statusLabels: { [key: string]: string } = {
  assigned: "Assigned",
  picked_up: "Pick up on",
  donated: "Donated",
};

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  status,
  setStatus,
  note,
  setNote,
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
        <h2 className="text-lg font-semibold mb-4">Add Cost & Weight</h2>

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
          <option
            value="donated"
            disabled={
              donation.status === "donated" ||
              donation.activityLog?.some((log) => log.action === "donated")
            }
          >
            Donated
          </option>
        </select>

        <textarea
          placeholder="Note (Optional)"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNote(e.target.value)
          }
          className="w-full border rounded-lg px-3 py-2 text-sm"
          rows={3}
        />

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
  note,
  setNote,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-lg relative">
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
        />

        <input
          type="number"
          placeholder="Scrap Weight (kg)"
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          value={weight}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setWeight(e.target.value)
          }
        />

        <textarea
          placeholder="Note (optional)"
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNote(e.target.value)
          }
        />

        <button
          onClick={onSave}
          className="mt-2 w-full bg-green-600 text-white rounded-full py-2 font-medium hover:bg-green-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const DonationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { authorizationToken } = useAuth();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [showScrapModal, setShowScrapModal] = useState<boolean>(false);
  const [price, setPrice] = useState<string>(donation?.price?.toString() || "");
  const [weight, setWeight] = useState<string>(
    donation?.weight?.toString() || ""
  );

  useEffect(() => {
    async function fetchDonation() {
      try {
        const res = await axios.get<{ donation: Donation }>(
          `${import.meta.env.VITE_BACK_URL}/auth/donations/${id}`,
          {
            headers: {
              Authorization: authorizationToken,
            },
          }
        );
        setDonation(res.data.donation);
      } catch (error) {
        console.error("Failed to fetch donation", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDonation();
  }, [authorizationToken, id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!donation)
    return (
      <div className="text-center py-20 text-red-500">Donation not found.</div>
    );

  const orderedStatuses = ["assigned", "picked-up", "donated"];

  const filteredActivity = orderedStatuses
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
    disabled?: boolean;
    isLoading?: boolean;
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
              {new Date(donation.pickupDate || "").toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </Section>

      {/* Pickup Address */}
      <Section title="Pickup Address">
        <div className="text-sm bg-gray-50 p-4 rounded-xl space-y-2">
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
        </div>
      </Section>

      {/* Assigned Dealer */}
      <Section title="Assigned Dealer">
        <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-6 text-sm text-gray-700">
          {donation.dealer?.firstName ? (
            <>
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500 shadow-md flex-shrink-0">
                <img
                  src={`${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
                    donation.dealer?.profileImage
                  }`}
                  alt="Dealer Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-lg">
                  {donation.dealer.firstName} {donation.dealer.lastName}
                </p>
                <p className="text-xs text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                  <Phone size={14} className="text-green-600" />
                  <span>{import.meta.env.VITE_ORG_CONTACT}</span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-400 italic">No dealer assigned yet.</p>
          )}
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
                    {/* Circle Number */}
                    <div
                      className={`absolute w-6 h-6 flex items-center justify-center rounded-full -left-3 text-xs font-semibold ${
                        isDone
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </div>

                    {/* Status Content */}
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
                              "en-IN",
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
      </Section>

      {(donation.status === "picked-up" || donation.status === "donated") && (
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
          </div>
        </Section>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 bg-gray-300 p-2 rounded-2xl font-medium hover:underline"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Modals */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => {} /* Add your save logic here */}
        status={selectedStatus}
        setStatus={setSelectedStatus}
        note={note}
        setNote={setNote}
        donation={donation}
      />

      <ScrapEditModal
        isOpen={showScrapModal}
        onClose={() => setShowScrapModal(false)}
        onSave={() => {} /* Add your save logic here */}
        weight={weight}
        setWeight={setWeight}
        price={price}
        setPrice={setPrice}
        note={note}
        setNote={setNote}
      />
    </div>
  );
};

export default DonationDetailPage;
