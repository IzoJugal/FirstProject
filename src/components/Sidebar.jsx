import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Settings, LogOut, LayoutDashboard, ClipboardPenLine, History, ContactRound, BellIcon, BellRingIcon, PackagePlus, PackageCheck, RecycleIcon } from "lucide-react";
import { useAuth } from "../authContext/Auth";
import { FaDonate, FaTasks } from "react-icons/fa";
import { GiCow } from "react-icons/gi";
import { useNotification } from "../authContext/useNotification";
import axios from "axios";
import { useEffect, useState } from "react";

const Sidebar = () => {
    const { authorizationToken } = useAuth();
    const { unreadCount } = useNotification();
    const { logout, user } = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [logoUrl, setLogoUrl] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/logo`, {
                    headers: { Authorization: authorizationToken },
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setLogoUrl(url);
            } catch (error) {
                console.error('Error fetching logo:', error);
            }
        };

        if (!logoUrl) fetchLogo();
    }, [logoUrl, authorizationToken]);

    const handleLogout = () => {
        logout();
        navigate("/");
        setIsSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const navItems = [
        { name: "Dashboard", path: "/volunteer-dashboard", icon: <Home size={20} />, roles: ["user", "volunteer"] },
        { name: "Dashboard", path: "/user-dashboard", icon: <Home size={20} />, roles: ["user"] },
        { name: "Dashboard", path: "/dealer-dashboard", icon: <Home size={20} />, roles: ["dealer"] },
        { name: "Dashboard", path: "/greensorts-dashboard", icon: <Home size={20} />, roles: ["recycler"] },
        { name: "Dashboard", path: "/admin-dashboard", icon: <Home size={20} />, roles: ["admin"] },
        {
            name: "Notifications",
            path: "/notifications",
            icon: unreadCount > 0 ? (
                <BellRingIcon size={20} className="text-red-500 animate-pulse" />
            ) : (
                <BellIcon size={20} />
            ),
            roles: ["user", "volunteer", "dealer", "admin", "recycler"]
        },
        { name: "Pickup Request", path: "/pickupRequest", icon: <ClipboardPenLine size={20} />, roles: ["admin"] },
        { name: "Tasks Details", path: "/tasks", icon: <FaTasks size={20} />, roles: ["admin"] },
        { name: "History Details", path: "/history", icon: <History size={20} />, roles: ["admin"] },
        { name: "GauDaan Details", path: "/gaudaan", icon: <GiCow size={20} />, roles: ["admin"] },
        { name: "Contacts Details", path: "/contacts", icon: <ContactRound size={20} />, roles: ["admin"] },
        { name: "Tasks Data", path: "/tasksdetails", icon: <FaTasks size={20} />, roles: ["volunteer"] },
        { name: "Gauddan Assigned Data", path: "/assignedgaudaan", icon: <GiCow size={20} />, roles: ["volunteer"] },
        { name: "Donations Data", path: "/donationdetails", icon: <FaDonate size={20} />, roles: ["user"] },
        { name: "Gaudaan Data", path: "/gaudaan-details", icon: <GiCow size={20} />, roles: ["user"] },
        { name: "Upcoming Pickups", path: "/pickupsdata", icon: <PackagePlus size={20} />, roles: ["dealer"] },
        { name: "History Data", path: "/historydata", icon: <PackageCheck size={20} />, roles: ["dealer"] },
        { name: "Recycaled Data", path: "/doantedlist", icon: <PackageCheck size={20} />, roles: ["dealer"] },
        { name: "Recycled Data", path: "/recycleddata", icon: <RecycleIcon size={20} />, roles: ["recycler"] },
        { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
    ];

    const orgName = "Gauabhayaranyam";

    return (
        <>
            {/* Hamburger Menu for Mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#579B52] text-white rounded-md"
                onClick={toggleSidebar}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 w-64 bg-white shadow-lg p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out z-40
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:min-h-screen`}
            >
                <div>
                    {/* Logo + Name */}
                    <div className="flex flex-col items-center gap-2 mb-6">
                        <img
                            src={logoUrl || "/images/gauabhayaranyam.png"}
                            alt="Logo"
                            className="w-20 h-20 object-contain rounded-md"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/images/gauabhayaranyam.png";
                            }}
                        />
                        <p className="text-center text-lg font-bold text-[#579B52] leading-tight">
                            {orgName}
                        </p>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <LayoutDashboard size={20} className="text-gray-700" />
                        Dashboard Panel
                    </h2>

                    {/* Nav Links */}
                    {navItems
                        .filter(item => {
                            if (!item.roles) return true;
                            if (item.name === "Dashboard") {
                                if (item.path === "/volunteer-dashboard") {
                                    return (
                                        (user?.roles?.length === 1 && user.roles.includes("volunteer")) ||
                                        (user?.roles?.length === 2 && user.roles.includes("user") && user.roles.includes("volunteer"))
                                    );
                                }
                                if (item.path === "/user-dashboard") {
                                    return (user?.roles?.length === 1 && user.roles.includes("user"));
                                }
                                if (item.path === "/dealer-dashboard") {
                                    return user?.roles?.includes("dealer");
                                }
                                if (item.path === "/greensorts-dashboard") {
                                    return user?.roles?.includes("recycler");
                                }
                                if (item.path === "/admin-dashboard") {
                                    return user?.roles?.length === 1 && user.roles.includes("admin");
                                }
                            }
                            return item.roles.some(role => user?.roles?.includes(role));
                        })
                        .map(item => {
                            const isNotification = item.name === "Notifications";
                            const isActive = pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? "bg-[#EEF6ED] text-[#579B52] font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
                                >
                                    {isNotification ? (
                                        <div className="relative">
                                            {unreadCount > 0 ? (
                                                <BellRingIcon className="text-red-500 animate-pulse w-5 h-5" />
                                            ) : (
                                                <BellIcon className="w-5 h-5" />
                                            )}
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        item.icon
                                    )}
                                    {item.name}
                                </Link>
                            );
                        })}
                </div>

                {/* Logout */}
                <div className="pt-6 border-t mt-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-sm text-gray-600 hover:text-red-600 transition w-full"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
        </>
    );
};

export default Sidebar;