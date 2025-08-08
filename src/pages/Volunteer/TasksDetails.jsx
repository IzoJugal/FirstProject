import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
};

const myVolunteerStatus = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
};

const TaskDetailModal = ({ task, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">{task.taskTitle}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <p><span className="font-semibold">Type:</span> {task.taskType}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(task.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }).replace(/ /g, " ")}</p>
                    <p><span className="font-semibold">Time:</span> {task.time}</p>
                    <p><span className="font-semibold">Address:</span> {task.address || "N/A"}</p>
                    <p className="sm:col-span-2"><span className="font-semibold">Description:</span> {task.description}</p>
                    <p className="sm:col-span-2">
                        <span className="font-semibold">Your Status:</span>{" "}
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${myVolunteerStatus[task.myVolunteerStatus]}`}>
                            {task.myVolunteerStatus}
                        </span>
                    </p>
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const ITEMS_PER_PAGE = 5;

const TasksDetails = () => {
    const { authorizationToken } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedTask, setSelectedTask] = useState(null);
    const [loadingTaskId, setLoadingTaskId] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/tasks`, {
                headers: {
                    Authorization: authorizationToken,
                },
            });
            const sortedTasks = [...res.data.tasks].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // newest first
            );

            setTasks(sortedTasks);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    }, [authorizationToken]);

    const handleAction = async (id, action) => {
        setLoadingTaskId(id);
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_BACK_URL}/auth/volunteer-tasks/${id}/status`,
                { action },
                {
                    headers: {
                        Authorization: authorizationToken,
                    },
                }
            );

            if (res.data?.success) {
                fetchTasks();
                toast.success(res.data.message || `Task ${action}ed successfully.`);
            } else {
                toast.warning("Could not update task status.");
            }
        } catch (err) {
            console.error("Status update failed:", err);
            toast.error("Failed to update task status.");
        } finally {
            setLoadingTaskId(false);
        }
    };


    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    const filteredTasks = tasks.filter((t) => {
        if (t.myVolunteerStatus === "rejected") return false;
        return filter === "all" || t.myVolunteerStatus === filter;
    });

    const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);



    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800">My Assigned Tasks</h2>

            {/* Filter */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Task list */}
            <div className="space-y-4">
                {paginatedTasks.map((task) => (
                    <div
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="border border-gray-200 bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{task.taskTitle}</h3>
                                <p className="text-sm text-gray-500">{task.taskType}</p>
                                <p className="mt-1 text-sm text-gray-700">
                                    Status:{" "}
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[task.status]}`}>
                                        {task.status}
                                    </span>
                                </p>
                            </div>

                            {task.myVolunteerStatus === "pending" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAction(task._id, "accept");
                                        }}
                                        disabled={loadingTaskId === task._id}
                                        className={`px-4 py-1.5 rounded-md text-sm text-white transition ${loadingTaskId === task._id
                                            ? "bg-green-300 cursor-not-allowed"
                                            : "bg-green-500 hover:bg-green-600"
                                            }`}
                                    >
                                        {loadingTaskId === task._id ? "Accepting..." : "Accept"}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAction(task._id, "reject");
                                        }}
                                        disabled={loadingTaskId === task._id}
                                        className={`px-4 py-1.5 rounded-md text-sm text-white transition ${loadingTaskId === task._id
                                            ? "bg-red-300 cursor-not-allowed"
                                            : "bg-red-500 hover:bg-red-600"
                                            }`}
                                    >
                                        {loadingTaskId === task._id ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700 text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modal */}
            {selectedTask && (
                <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    );
};

export default TasksDetails;
