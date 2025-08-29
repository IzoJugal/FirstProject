import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  IndianRupee,
  LoaderCircle,
  MapPin,
  Phone,
  Wallet,
  Weight,
} from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";

// ---------- Interfaces ----------
interface Donor {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
}

interface Dealer {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
}

interface DonationImage {
  url: string;
}

interface Donation {
  _id: string;
  scrapType: string;
  description: string;
  pickupDate: string;
  pickupTime?: string;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  donatedAt?: string;
  note?: string;
  price?: number;
  weight?: number;
  status: "pending" | "assigned" | "picked-up" | "donated" | "rejected";
  donor?: Donor;
  dealer?: Dealer;
  images: DonationImage[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
}

interface StatusStep {
  label: string;
  date: string;
}

const DonationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authorizationToken } = useAuth();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showDonatedConfirm, setShowDonatedConfirm] = useState(false);
  const [isMarkingDonated, setIsMarkingDonated] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await axios.get<{ donation: Donation }>(
          `${import.meta.env.VITE_BACK_URL}/admin/pickups/${id}`,
          {
            headers: { Authorization: authorizationToken },
          }
        );
        setDonation(res.data.donation);
      } catch (err) {
        console.error("Failed to fetch donation:", err);
      }
    };

    if (authorizationToken) {
      fetchDonation();
    }
  }, [id, authorizationToken, navigate]);

  const fetchDealers = async () => {
    try {
      const res = await axios.get<{ dealers: Dealer[] }>(
        `${import.meta.env.VITE_BACK_URL}/admin/dealers`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDealers(res.data.dealers || []);
    } catch (err) {
      console.error("Failed to fetch dealers:", err);
    }
  };

  const handleAccept = () => {
    fetchDealers();
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!donation) return;
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/assigndealer/${donation._id}`,
        { dealerId: selectedDealer, notes },
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Dealer assigned successfully!");
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Error assigning dealer:", err);
      toast.error("Assignment failed");
    }
  };

  const handleReject = async () => {
    if (!donation) return;
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/donations/${donation._id}/reject`,
        {},
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Donation rejected.");
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Error rejecting donation:", err);
      toast.error("Rejection failed");
    }
  };

  const handleMarkAsDonated = async () => {
    if (!donation) return;
    setIsMarkingDonated(true);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/donations/${donation._id}/donated`,
        {},
        { headers: { Authorization: authorizationToken } }
      );
      toast.success("Donation marked as donated and certificate sent!");
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Error marking donation as donated:", err);
      toast.error("Failed to mark as donated");
    } finally {
      setIsMarkingDonated(false);
    }
  };

  if (!donation) return <div className="text-center py-10">Loading...</div>;

  const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short", // 👉 gives "Aug" instead of "August"
    year: "numeric",
  });
};


  // -------- Build status list --------
  const statusList: StatusStep[] = [];
  if (donation.status === "donated") {
    statusList.push({ label: "Assigned", date: donation.assignedAt || donation.createdAt });
    statusList.push({ label: "Pick up on", date: donation.pickedUpAt || donation.updatedAt });
    statusList.push({ label: "Donated", date: donation.donatedAt || donation.updatedAt });
  } else if (donation.status === "picked-up") {
    statusList.push({ label: "Assigned", date: donation.assignedAt || donation.createdAt });
    statusList.push({ label: "Pick up on", date: donation.pickedUpAt || donation.updatedAt });
  } else if (donation.status === "assigned") {
    statusList.push({ label: "Assigned", date: donation.assignedAt || donation.updatedAt });
  }

  const profileImg = donation.donor?.profileImage
    ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.donor.profileImage}`
    : "img/profile-image.webp";

  const dealerImg = donation.dealer?.profileImage
    ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.dealer.profileImage}`
    : "img/profile-image.webp";

  const fullAddress = `${donation.addressLine1 || ""}, ${donation.addressLine2 || ""}, ${donation.city || ""} ${donation.country || ""}`;

    return (
        <div className="max-w-xl mx-auto p-4 space-y-6">

            {donation.images.length > 0 && (
                <img
                    src={`${import.meta.env.VITE_BACK_URL}/auth${donation.images[0]?.url}`}
                    alt="Donation"
                    className="w-full h-52 object-cover rounded-xl shadow-md"
                />
            )}

            <h2 className="text-2xl font-bold text-gray-800">Donate {donation.scrapType}</h2>

            <div>
                <h3 className="text-lg font-semibold text-gray-700">Description</h3>
                <p className="mt-1 text-gray-600 p-3 bg-gray-50 rounded-lg border">{donation.description}</p>
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-700">Schedule Pickup</h3>
                <div className="flex items-center gap-4 text-gray-600 mt-1">
                    <Clock size={20} /> {donation.pickupTime || 'N/A'}
                    <CalendarDays size={20} className="ml-4" />
                    {formatDate(donation.pickupDate)}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-700">Contact Details</h3>
                <div className="bg-white shadow rounded-lg p-3 flex items-center gap-4">
                    <img src={profileImg} alt="Donor" className="h-12 w-12 rounded-full object-cover border" />
                    <div>
                        <p className="font-semibold">{donation.donor?.firstName} {donation.donor?.lastName}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone size={14} /> +91 {donation.donor?.phone}
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

            {donation.dealer && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Scrap Dealer</h3>
                    <div className="bg-white shadow rounded-lg p-3 flex items-center gap-4 my-2">
                        <img src={dealerImg} alt="Dealer" className="h-12 w-12 rounded-full object-cover border" />
                        <div>
                            <p className="font-semibold">{donation.dealer.firstName} {donation.dealer.lastName}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone size={14} /> +91 {donation.dealer.phone}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Activity</h3>
                <ol className="relative border-l-2 border-green-300 ml-4 space-y-6">
                    {statusList.map((step, idx) => (
                        <li key={idx} className="ml-4 relative">
                            <div className="absolute -left-7 flex items-center justify-center w-6 h-6 bg-green-500 text-white  rounded-full text-sm font-semibold">
                                {idx + 1}
                            </div>
                            <div>
                                <p className="text-base font-semibold text-gray-800">{step.label}</p>
                                <p className="text-sm text-gray-600">{formatDate(step.date)}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            {donation.status === "picked-up" && (
                <div className="rounded-xl p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-3">Scrap Weight & Price</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Price Box */}
                        <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-green-700 font-semibold text-lg">
                            <span className="flex items-center gap-1">
                                <IndianRupee className='text-sm' />
                                {donation.price?.toLocaleString() ?? '0'}
                            </span>
                            <Wallet size={20} />
                        </div>


                        {/* Weight Box */}
                        <div className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-green-700 font-semibold text-lg">
                            <span>{donation.weight ?? '0'} kg</span>
                            <Weight size={20} />
                        </div>
                    </div>

                    {/* Note Box */}
                    {donation.note && (
                        <div className="border border-gray-300 rounded-md p-3 text-gray-700 text-sm whitespace-pre-wrap">
                            {donation.note}
                        </div>
                    )}
                </div>
            )}

            {donation.status === 'pending' && (
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

            {/* Donated Confirmation */}
            {donation.status === 'picked-up' && (
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-700">Action</h3>
                    <div className="flex justify-center gap-4 pt-4">
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition"
                            onClick={() => setShowDonatedConfirm(true)}
                        >
                            Mark as Donated
                        </button>
                    </div>
                </div>
            )}

            {/* Donated Confirmation Modal */}
            {showDonatedConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
                        <h3 className="text-lg font-semibold mb-4">Are you sure you want to mark this donation as donated?</h3>
                        <p className="text-sm text-gray-600 mb-4">This will send a certificate to the donor.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setShowDonatedConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 py-2 rounded flex items-center justify-center gap-2 ${isMarkingDonated ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                                onClick={handleMarkAsDonated}
                                disabled={isMarkingDonated}
                            >
                                {isMarkingDonated && (
                                    <LoaderCircle className='animate-spin' />
                                )}
                                {isMarkingDonated ? 'Processing...' : 'Confirm Donated'}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Assign Dealer</h3>
                        <select className="w-full border p-2 rounded mb-4" value={selectedDealer} onChange={(e) => setSelectedDealer(e.target.value)}>
                            <option value="">Select Dealer</option>
                            {dealers.map((dealer) => (
                                <option key={dealer._id} value={dealer._id}>{dealer.firstName} {dealer.lastName} - {dealer.phone}</option>
                            ))}
                        </select>
                        <textarea rows={3} className="w-full border p-2 rounded mb-4" placeholder="Optional Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowAssignModal(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleAssign} disabled={!selectedDealer}>Assign</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-lg text-green-700 bg-gray-300 rounded-2xl p-3 font-semibold"
                >
                    <ArrowLeft className="mr-1" size={32} />
                    Back
                </button>
            </div>


            {/* Reject Confirmation */}
            {showRejectConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
                        <h3 className="text-lg font-semibold mb-4">Are you sure you want to reject this donation?</h3>
                        <div className="flex justify-center gap-4">
                            <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowRejectConfirm(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleReject}>Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonationDetail;
