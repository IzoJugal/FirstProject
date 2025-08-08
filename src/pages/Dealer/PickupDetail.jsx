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
import { toast } from "react-toastify";


const Images = [
    "/img/img1.jpg",
    "/img/img2.jpg",
    "/img/img2.jpg"
];

const statusLabels = {
    assigned: "Assigned",
    picked_up: "Pick up on",
    donated: "Donated",
};

const StatusModal = ({ isOpen, onClose, onSave, status, setStatus, note, setNote, donation }) => {
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
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Select Status</option>
                    <option
                        value="picked-up"
                        disabled={
                            donation.status === "picked-up" ||
                            donation.status === "donated" ||  // already donated → can't go back
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
                    onChange={(e) => setNote(e.target.value)}
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

const ScrapEditModal = ({ isOpen, onClose, onSave, weight, setWeight, price, setPrice, note, setNote }) => {
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
                    onChange={(e) => setPrice(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Scrap Weight (kg)"
                    className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                />

                <textarea
                    placeholder="Note (optional)"
                    className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
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


const PickupDetail = () => {
    const { id } = useParams();
    const { authorizationToken } = useAuth();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [isSavingScrapDetails, setIsSavingScrapDetails] = useState(false);


    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [note, setNote] = useState("");

    const [showScrapModal, setShowScrapModal] = useState(false);
    const [price, setprice] = useState(donation?.price || "");
    const [weight, setweight] = useState(donation?.weight || "");

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % Images.length);
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    const goToSlide = (i) => setIndex(i);

    useEffect(() => {
        async function fetchDonation() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/donation/${id}`, {
                    headers: {
                        Authorization: authorizationToken,
                    },
                });
                setDonation(res.data.donation);
            } catch (error) {
                console.error("Failed to fetch donation", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDonation();
    }, [authorizationToken, id]);

    const handleSaveStatus = async () => {
        if (!selectedStatus) {
            toast.warning("Please select a status before saving.");
            return;
        }

        if (
            selectedStatus === "donated" &&
            (!donation.price || !donation.weight)
        ) {
            toast.error("Please update scrap price and weight before marking as 'Donated'.");
            return;
        }

        try {
            setIsSavingStatus(true);

            await axios.patch(
                `${import.meta.env.VITE_BACK_URL}/auth/donation/${donation._id}/status`,
                {
                    status: selectedStatus,
                    note,
                },
                {
                    headers: { Authorization: authorizationToken },
                }
            );


            setShowModal(false);
            setSelectedStatus("");
            setNote("");
            const updated = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/donation/${id}`, {
                headers: { Authorization: authorizationToken },
            });
            setDonation(updated.data.donation);
        } catch (error) {
            console.error("Error updating status", error);
        } finally {
            setIsSavingStatus(false);

        }
    };

    const handleSaveScrapDetails = async () => {
        try {
            setIsSavingScrapDetails(true);
            await axios.patch(
                `${import.meta.env.VITE_BACK_URL}/auth/donations/${donation._id}/update`,
                {
                    price,
                    weight,
                    note,
                },
                {
                    headers: { Authorization: authorizationToken },
                }
            );
            toast.success("Scrap details updated!");
            setShowScrapModal(false);

            const updated = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/donation/${id}`, {
                headers: { Authorization: authorizationToken },
            });
            setDonation(updated.data.donation);
        } catch (error) {
            console.error("Failed to update scrap details", error);
            toast.error("Failed to update scrap details.");
        } finally {
            setIsSavingScrapDetails(true);
        }
    };


    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!donation) return <div className="text-center py-20 text-red-500">Donation not found.</div>;

    const orderedStatuses = ["assigned", "picked-up", "donated"];

    const filteredActivity = orderedStatuses
        .map((status) => donation.activityLog?.find((act) => act.action === status))
        .filter(Boolean);

    const Section = ({ title, children }) => (
        <section>
            <h3 className="text-base font-semibold mb-1">{title}</h3>
            {children}
        </section>
    );

    const PrimaryButton = ({ label, onClick, disabled, isLoading }) => (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`mt-3 w-full text-sm border rounded-full py-2 font-medium transition flex items-center justify-center gap-2 ${disabled || isLoading
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
                            className={`w-3 h-3 rounded-full border ${i === index ? "bg-green-600" : "bg-white"}`}
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
                <p className="text-sm text-gray-700 leading-relaxed">{donation.description}</p>
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
                        <span>{new Date(donation.pickupDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </Section>

            {/* Pickup Address */}
            <Section title="Pickup Address">
                <div className="text-sm bg-gray-50 p-4 rounded-xl space-y-2">
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${donation.city}, ${donation.pincode}, ${donation.country}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        <div className="flex gap-2 items-start">
                            <Home size={16} className="mt-1" />
                            <span>{donation.addressLine1}, {donation.addressLine2}</span>
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
                            src={`${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.donor?.profileImage}`}
                            alt="Donor Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                        <p className="text-base font-semibold text-gray-800">
                            {donation.donor?.firstName} {donation.donor?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                            <Phone size={14} className="text-green-600" />
                            +91 {donation.donor?.phone || donation.phone}
                        </p>
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
                                    src={`${import.meta.env.VITE_BACK_URL}/auth/profile/image/${donation.dealer?.profileImage}`}
                                    alt="Dealer Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="font-medium">{donation.dealer.firstName} {donation.dealer.lastName}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Mail size={14} className="text-gray-400" /> {donation.dealer.email}
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
                                const activity = donation.activityLog?.find((act) => act.action === statusKey);
                                const isDone = Boolean(activity);

                                return (
                                    <li key={statusKey} className="relative">
                                        {/* Circle Number */}
                                        <div
                                            className={`absolute w-6 h-6 flex items-center justify-center rounded-full -left-3 text-xs font-semibold 
          ${isDone ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}
                                        >
                                            {i + 1}
                                        </div>

                                        {/* Status Content */}
                                        <div className="ml-4">
                                            <p className={`text-sm font-semibold ${isDone ? "text-blue-900" : "text-gray-400"}`}>
                                                {statusLabels[statusKey] || statusKey}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {activity
                                                    ? new Date(activity.timestamp).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric",
                                                    })
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

                {/* Change Status Button */}
                <PrimaryButton
                    label="Change Status"
                    disabled={donation.status === "donated"}
                    onClick={() => setShowModal(true)}
                    isLoading={isSavingStatus}
                />
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

                    <PrimaryButton
                        label="Edit Details"
                        disabled={donation.status === "donated" || (donation.price && donation.weight)}
                        onClick={() => {
                            setprice(donation.price || "");
                            setweight(donation.weight || "");
                            setNote(donation.note || "");
                            setShowScrapModal(true);
                        }}
                        isLoading={isSavingScrapDetails}
                    />
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
                onSave={handleSaveStatus}
                status={selectedStatus}
                setStatus={setSelectedStatus}
                note={note}
                setNote={setNote}
                donation={donation}
            />

            <ScrapEditModal
                isOpen={showScrapModal}
                onClose={() => setShowScrapModal(false)}
                onSave={handleSaveScrapDetails}
                weight={weight}
                setWeight={setweight}
                price={price}
                setPrice={setprice}
                note={note}
                setNote={setNote}
            />
        </div>

    );
};

export default PickupDetail;
