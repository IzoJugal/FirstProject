import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ArrowLeftIcon, CameraIcon, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../authContext/Auth";
import { useNavigate } from "react-router-dom";

const UserData = () => {
    const { authorizationToken } = useAuth();
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;
    const [editUser, setEditUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/admin/users`, {
                headers: {
                    Authorization: authorizationToken,
                },
            });
            setUsers(res.data.users);
        } catch (err) {
            toast.error("Failed to load users", err);
        }
    }, [authorizationToken]);

    const toggleActive = async (id, current) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_BACK_URL}/admin/users/${id}/active`,
                { isActive: !current },
                {
                    headers: {
                        Authorization: authorizationToken,
                    },
                }
            );
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === id ? { ...user, isActive: !current } : user
                )
            );
            toast.success(`Status updated: ${!current ? "Active" : "Inactive"}`);
        } catch {
            toast.error("Failed to toggle status");
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACK_URL}/admin/users/${id}`, {
                headers: {
                    Authorization: authorizationToken,
                },
            });
            setUsers((prev) => prev.filter((u) => u._id !== id));
            toast.success("User deleted");
        } catch {
            toast.error("Failed to delete user");
        }
    };

    const updateDetails = async () => {
        try {
            const formData = new FormData();
            formData.append("firstName", editUser.firstName);
            formData.append("lastName", editUser.lastName);
            formData.append("phone", editUser.phone);

            if (editUser.profileImage instanceof File) {
                formData.append("profileImage", editUser.profileImage);
            }

            const res = await axios.patch(
                `${import.meta.env.VITE_BACK_URL}/admin/users/${editUser._id}`,
                formData,
                {
                    headers: {
                        Authorization: authorizationToken,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setUsers((prev) =>
                prev.map((u) => (u._id === editUser._id ? res.data.user : u))
            );
            toast.success("User updated successfully");
            setShowModal(false);
        } catch (err) {
            toast.error("Failed to update user", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [authorizationToken, fetchUsers]);

    // Reset currentPage to 1 when query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [query]);

    // Filter the users based on the search query
    const filteredUsers = users.filter((u) => {
        const search = query.toLowerCase();
        return (
            u.firstName?.toLowerCase().includes(search) ||
            u.lastName?.toLowerCase().includes(search) ||
            u.phone?.includes(search)
        );
    });

    // Pagination logic applied to the filtered data
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button
                    className="w-6 h-8 text-sm font-medium hover:scale-105 hover:text-blue-600 text-gray-700"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-2xl font-bold">Users</h1>
                <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border px-3 py-2 rounded-md text-sm w-1/2"
                />
            </div>

            <div className="space-y-4">
                {paginatedUsers.map((user) => (
                    <div
                        key={user._id}
                        className="border rounded-md p-4 flex items-center gap-4 shadow-sm"
                    >
                        <img
                            src={
                                user.profileImage
                                    ? user.profileImage.startsWith("http")
                                        ? user.profileImage
                                        : `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${user.profileImage}`
                                    : "img/profile-image.webp"
                            }
                            alt="profileImage"
                            className="w-12 h-12 rounded-full object-cover"
                        />

                        <div className="flex-1">
                            <p className="font-semibold">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                            <p className="text-green-600 text-sm font-medium mt-1">
                                {user.roles.includes("user") && "Donor"}
                                {user.roles.includes("user") &&
                                    user.roles.includes("volunteer") &&
                                    " & "}
                                {user.roles.includes("volunteer") && "Volunteer"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-gray-700">
                                    Status
                                </span>
                                <div
                                    onClick={() => toggleActive(user._id, user.isActive)}
                                    className={`w-10 h-5 flex items-center rounded-full px-1 cursor-pointer ${
                                        user.isActive ? "bg-green-300" : "bg-red-300"
                                    }`}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full transition-all ${
                                            user.isActive ? "bg-green-700 ml-auto" : "bg-red-600"
                                        }`}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                className="text-green-600 hover:text-green-800"
                                onClick={() => {
                                    setEditUser(user);
                                    setShowModal(true);
                                }}
                            >
                                <Pencil size={20} />
                            </button>

                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteUser(user._id)}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm relative text-center">
                        <div className="relative mx-auto mb-4">
                            <img
                                src={
                                    editUser.profileImage instanceof File
                                        ? URL.createObjectURL(editUser.profileImage)
                                        : editUser.profileImage
                                        ? editUser.profileImage.startsWith("http")
                                            ? editUser.profileImage
                                            : `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${editUser.profileImage}`
                                        : "img/profile-image.webp"
                                }
                                alt="profileImage"
                                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow"
                            />

                            <label
                                htmlFor="profileImageUpload"
                                className="absolute -bottom-2 right-[35%] bg-green-600 p-2 rounded-full cursor-pointer"
                            >
                                <input
                                    id="profileImageUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setEditUser({
                                            ...editUser,
                                            profileImage: e.target.files[0],
                                        })
                                    }
                                    className="hidden"
                                />
                                <CameraIcon size={18} className="text-white" />
                            </label>
                        </div>

                        <div className="space-y-3 text-left">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={editUser.firstName}
                                    onChange={(e) =>
                                        setEditUser({
                                            ...editUser,
                                            firstName: e.target.value,
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded-md pl-10"
                                    placeholder="First Name"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">
                                    <i className="fas fa-user" />
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={editUser.lastName}
                                    onChange={(e) =>
                                        setEditUser({
                                            ...editUser,
                                            lastName: e.target.value,
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded-md pl-10"
                                    placeholder="Last Name"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">
                                    <i className="fas fa-user" />
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={editUser.phone}
                                    onChange={(e) =>
                                        setEditUser({
                                            ...editUser,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full border px-3 py-2 rounded-md pl-10"
                                    placeholder="Phone"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">
                                    <i className="fas fa-phone" />
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    value={editUser.email}
                                    disabled
                                    className="w-full border px-3 py-2 rounded-md pl-10 bg-gray-100 text-gray-500"
                                    placeholder="Email"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500">
                                    <i className="fas fa-envelope" />
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateDetails}
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {paginatedUsers.length === 0 && (
                <p className="text-center text-gray-400 text-sm">No users found.</p>
            )}

            <div className="mt-4 flex justify-center items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={`w-8 h-8 rounded-full text-sm font-medium ${
                            currentPage === i + 1
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default UserData;