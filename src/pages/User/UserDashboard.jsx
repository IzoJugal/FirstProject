    import React, { useEffect, useState } from "react";
    import { Handshake, CalendarCheck, Truck } from "lucide-react";
    import { useAuth } from "../../authContext/Auth";
    import { Dialog } from "@headlessui/react";
    import dayjs from "dayjs";
    import utc from "dayjs/plugin/utc";
    import timezone from "dayjs/plugin/timezone";
    import { toast } from "react-toastify";

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const UserDashboard = () => {
        const { authorizationToken, logout, user, setUser } = useAuth();
        const [stats, setStats] = useState({
            assigned: 0,
            upcoming: 0,
            completed: 0,
        });
        const [loading, setLoading] = useState(false);
        const [isModalOpen, setIsModalOpen] = useState(false);

        const handleJoinVolunteer = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/assign-volunteer`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: authorizationToken,
                    },
                });

                if (!res.ok) throw new Error("Failed to update role");

                const { user: updatedUser } = await res.json();
                setUser?.(updatedUser); 
                setIsModalOpen(false);
                toast.success("You Join as a Volunteer Successfully.");
                toast.info("Please Re-Login.");
                logout();
            } catch (error) {
                console.error("Failed to become volunteer:", error);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            const fetchStats = async () => {
                try {
                    const countRes = await fetch(
                        `${import.meta.env.VITE_BACK_URL}/auth/donations/count-by-status`,
                        { headers: { Authorization: authorizationToken } }
                    );

                    if (!countRes.ok) throw new Error("Failed to fetch stats");

                    const countData = await countRes.json();
                    setStats({ counts: countData.counts || {} });
                } catch (err) {
                    console.error("Error fetching dashboard stats:", err);
                }
            };

            if (authorizationToken) {
                fetchStats();
            }
        }, [authorizationToken]);

        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold">Welcome, {user?.name} 👋</h1>

                {/* Show join volunteer button only if not already a volunteer */}
                {!user?.roles?.includes("volunteer") && (
                    <div className="bg-green-100 m-3 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                        <div className="flex items-center gap-4">
                            <img
                                src="/hero_1.png"
                                alt="Volunteer"
                                className="w-24  rounded-md"
                            />
                            <div>
                                <h2 className="text-lg font-semibold text-green-800">Want to Help On Ground?</h2>
                                <p className="text-sm text-green-700">
                                    <span className="font-medium">Join as a volunteer</span> — support pickups, outreach & more.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition whitespace-nowrap"
                        >
                            Become a Volunteer
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Pending Donations"
                        value={stats?.counts?.pending ?? 0}
                        icon={<Handshake className="text-blue-600" />}
                    />
                    <StatCard
                        title="In Progress"
                        value={stats?.counts?.["in-progress"] ?? 0}
                        icon={<CalendarCheck className="text-green-600" />}
                    />
                    <StatCard
                        title="Completed"
                        value={stats?.counts?.completed ?? 0}
                        icon={<Truck className="text-yellow-600" />}
                    />
                </div>

                {/* Confirmation Modal */}
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 px-4">
                        <Dialog.Panel className="bg-white p-6 rounded-xl max-w-sm w-full relative shadow-lg">
                            {/* Close Button (Top Right) */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-lg font-bold"
                                aria-label="Close"
                            >
                                ×
                            </button>

                            {/* Title */}
                            <Dialog.Title className="text-lg font-semibold mb-3 text-gray-800">
                                Confirm Your Action
                            </Dialog.Title>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                You're about to join our on-ground volunteer team. <br />
                                You'll be contacted for pickups, outreach and more.
                            </p>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleJoinVolunteer}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                    disabled={loading}
                                >
                                    {loading ? "Joining..." : "Confirm"}
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>

            </div>
        );
    };

    const StatCard = ({ title, value, icon }) => (
        <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-semibold">{value}</p>
            </div>
        </div>
    );

    export default UserDashboard;
