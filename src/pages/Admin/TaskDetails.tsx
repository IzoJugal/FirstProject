/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useCallback,
  useEffect,
  useState,
  memo,
  ChangeEvent,
} from "react";
import axios, { AxiosResponse } from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Trash2 } from "lucide-react";

// Define interfaces for data structures
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Volunteer {
  user?: User;
  status?: string;
}

interface Task {
  _id: string;
  taskTitle: string;
  taskType: string;
  description: string;
  date: string;
  time: string;
  address: string;
  status: string;
  volunteers: Volunteer[];
  createdAt?: string;
}

interface FormData {
  taskTitle: string;
  taskType: string;
  description: string;
  date: string;
  time: string;
  volunteer: string[];
  address: string;
  status: string;
}

interface VolunteerData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContext {
  authorizationToken: string;
}

interface TaskResponse {
  tasks: Task[];
}

interface VolunteerResponse {
  volunteers: VolunteerData[];
}

interface TaskActionResponse {
  success: boolean;
  message?: string;
}

// InputField component
interface InputFieldProps {
  label: string;
  field: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const InputField = memo(
  ({
    label,
    field,
    type = "text",
    required = false,
    value,
    onChange,
    error,
  }: InputFieldProps) => (
    <div className="flex flex-col">
      <label
        htmlFor={field}
        className="block text-sm font-medium mb-1 text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={field}
        name={field}
        type={type}
        value={value || ""}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={`Enter ${label}`}
        aria-required={required}
        aria-invalid={!!error}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
);

// VolunteerSelect component
interface VolunteerSelectProps {
  value: string[];
  onChange: (e: {
    target: {
      name: string;
      value: string[];
      selectedOptions: { value: string }[];
    };
  }) => void;
  volunteers: VolunteerData[];
  error?: string;
}

const VolunteerSelect = memo(
  ({ value, onChange, volunteers, error }: VolunteerSelectProps) => {
    const handleCheckboxChange = (volunteerId: string) => {
      const newValue = value.includes(volunteerId)
        ? value.filter((id) => id !== volunteerId)
        : [...value, volunteerId];
      onChange({
        target: {
          name: "volunteer",
          value: newValue,
          selectedOptions: newValue.map((id) => ({ value: id })),
        },
      });
    };

    return (
      <div className="flex flex-col">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Assign Volunteers <span className="text-red-500">*</span>
        </label>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 mb-2 bg-white">
          {volunteers.length === 0 ? (
            <p className="text-sm text-gray-500">No volunteers available</p>
          ) : (
            volunteers.map((vol) => (
              <div key={vol._id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={`volunteer-${vol._id}`}
                  value={vol._id}
                  checked={value.includes(vol._id)}
                  onChange={() => handleCheckboxChange(vol._id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`volunteer-${vol._id}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {vol.firstName} {vol.lastName} ({vol.email})
                </label>
              </div>
            ))
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

// StatusSelect component
interface StatusSelectProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled: boolean;
}

const StatusSelect = memo(
  ({ value, onChange, error, disabled }: StatusSelectProps) => (
    <div className="flex flex-col">
      <label
        htmlFor="status"
        className="block text-sm font-medium mb-1 text-gray-700"
      >
        Status <span className="text-red-500">*</span>
      </label>
      <select
        id="status"
        name="status"
        value={value || "pending"}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        aria-required="true"
        aria-invalid={!!error}
      >
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
);

// TaskCard component
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isDeleting: boolean;
}

const TaskCard = memo(
  ({ task, onEdit, onDelete, isDeleting }: TaskCardProps) => {
    const status = task.status || "pending";
    const isPastDate =
      task.date &&
      new Date(task.date) < new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <div
        onClick={isPastDate ? undefined : () => onEdit(task)}
        onKeyDown={(e) => !isPastDate && e.key === "Enter" && onEdit(task)}
        tabIndex={isPastDate ? -1 : 0}
        className={`p-4 bg-white border rounded-xl shadow-sm space-y-2 transition ${
          isPastDate
            ? "bg-gray-100 cursor-not-allowed opacity-70"
            : "hover:shadow-md cursor-pointer focus:ring-4 focus:ring-blue-600"
        }`}
        role="button"
        aria-label={
          isPastDate
            ? `Task ${task.taskTitle} (past task, cannot be edited)`
            : `Edit task ${task.taskTitle}`
        }
        title={isPastDate ? "Cannot edit past tasks" : undefined}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-blue-700">
            {task.taskTitle}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isDeleting}
            aria-label="Delete task"
          >
            <Trash2 />
          </button>
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Type:</span> {task.taskType || "N/A"}
        </p>
        <p className="text-sm">
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${
              status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : status === "active"
                ? "bg-green-100 text-green-800"
                : status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </p>
        <div className="text-sm text-gray-700">
          <span className="font-medium">Volunteers:</span>{" "}
          {task.volunteers && task.volunteers.length > 0 ? (
            <ul className="list-disc pl-4">
              {task.volunteers.map((vol) => (
                <li key={vol.user?._id || Math.random()}>
                  {vol.user?.firstName || "Unknown"} {vol.user?.lastName || ""}{" "}
                  (
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      vol.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : vol.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : vol.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {vol.status
                      ? vol.status.charAt(0).toUpperCase() + vol.status.slice(1)
                      : "N/A"}
                  </span>
                  )
                </li>
              ))}
            </ul>
          ) : (
            "Unassigned"
          )}
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Address:</span> {task.address || "N/A"}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Date:</span>{" "}
          {task.date
            ? new Date(task.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A"}{" "}
          at {task.time || "N/A"}
        </p>
        <p className="text-sm text-gray-500">
          Assigned On:{" "}
          {task.createdAt
            ? new Date(task.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A"}
        </p>
        {isPastDate && (
          <p className="text-xs text-red-600 mt-2">
            This task is in the past and cannot be edited.
          </p>
        )}
      </div>
    );
  }
);

const TaskDetails: React.FC = () => {
  const { authorizationToken } = useAuth() as AuthContext;
  const [displayTasks, setDisplayTasks] = useState<Task[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [taskLoading, setTaskLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const initialFormData: FormData = {
    taskTitle: "",
    taskType: "",
    description: "",
    date: "",
    time: "",
    volunteer: [],
    address: "",
    status: "pending",
  };
  const [modalFormData, setModalFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [filters, setFilters] = useState({ status: "" });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<TaskResponse> = await axios.get(
        `${import.meta.env.VITE_BACK_URL}/admin/tasks`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setDisplayTasks(res.data.tasks || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(`Failed to fetch tasks: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [authorizationToken]);

  const fetchVolunteers = useCallback(async () => {
    try {
      const res: AxiosResponse<VolunteerResponse> = await axios.get(
        `${import.meta.env.VITE_BACK_URL}/admin/volunteers`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setVolunteers(res.data.volunteers || []);
    } catch (err: any) {
      toast.error(`Failed to fetch volunteers: ${err.message}`);
    }
  }, [authorizationToken]);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setTaskLoading((prev) => ({ ...prev, [taskId]: true }));
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACK_URL}/admin/task/${taskId}`,
          {
            headers: { Authorization: authorizationToken },
          }
        );
        toast.success("Task deleted successfully");
        await fetchTasks();
      } catch (err: any) {
        toast.error(
          `Failed to delete task: ${err.response?.data?.message || err.message}`
        );
      } finally {
        setTaskLoading((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [authorizationToken, fetchTasks]
  );

  useEffect(() => {
    if (modalFormData.date && modalFormData.time) {
      const date = new Date(`${modalFormData.date} ${modalFormData.time}`);
      setDateTime(isNaN(date.getTime()) ? null : date);
    } else {
      setDateTime(null);
    }
  }, [modalFormData.date, modalFormData.time]);

  useEffect(() => {
    if (showModal) {
      fetchVolunteers();
    }
  }, [showModal, fetchVolunteers]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === "volunteer") {
        const selectedValues = Array.isArray(value)
          ? value
          : Array.from(
              (e.target as HTMLSelectElement).selectedOptions || []
            ).map((option) => option.value);
        setModalFormData((prev) => ({ ...prev, [name]: selectedValues }));
      } else {
        setModalFormData((prev) => ({ ...prev, [name]: value }));
      }
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleDateTimeChange = (date: Date | null) => {
    setDateTime(date);
    setModalFormData((prev) => ({
      ...prev,
      date: date ? date.toISOString().split("T")[0] : "",
      time: date
        ? date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "",
    }));
    setFormErrors((prev) => ({ ...prev, date: "", time: "" }));
  };

  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    const requiredFields: (keyof FormData)[] = [
      "taskTitle",
      "taskType",
      "description",
      "date",
      "time",
      "address",
      "status",
    ];
    requiredFields.forEach((field) => {
      if (!modalFormData[field]) {
        errors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    if (modalFormData.date) {
      const parsedDate = new Date(modalFormData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(parsedDate.getTime())) {
        errors.date = "Invalid date format";
      } else if (parsedDate < today) {
        errors.date = "Date cannot be in the past";
      }
    }

    if (!modalFormData.volunteer.length) {
      errors.volunteer = "At least one volunteer is required";
    }

    if (
      modalFormData.status &&
      !["pending", "active", "completed", "cancelled"].includes(
        modalFormData.status
      )
    ) {
      errors.status = "Invalid status";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [modalFormData]);

  const handleCreateTask = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    setIsCreating(true);
    try {
      const response: AxiosResponse<TaskActionResponse> = await axios.post(
        `${import.meta.env.VITE_BACK_URL}/admin/task`,
        { ...modalFormData, volunteers: modalFormData.volunteer },
        {
          headers: { Authorization: authorizationToken },
        }
      );
      toast.success(response.data.message || "Task created successfully");
      setModalFormData(initialFormData);
      setShowModal(false);
      setFormErrors({});
      await fetchTasks();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to create task: ${err.message}`
      );
    } finally {
      setIsCreating(false);
    }
  }, [modalFormData, authorizationToken, fetchTasks, validateForm]);

  const handleEditTask = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }
    setIsEditing(true);
    try {
      const response: AxiosResponse<TaskActionResponse> = await axios.patch(
        `${import.meta.env.VITE_BACK_URL}/admin/task/${editTaskId}`,
        { ...modalFormData, volunteers: modalFormData.volunteer },
        {
          headers: { Authorization: authorizationToken },
        }
      );
      toast.success(response.data.message || "Task updated successfully");
      setModalFormData(initialFormData);
      setShowModal(false);
      setModalMode("create");
      setEditTaskId(null);
      setFormErrors({});
      await fetchTasks();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to update task: ${err.message}`
      );
    } finally {
      setIsEditing(false);
    }
  }, [modalFormData, editTaskId, authorizationToken, fetchTasks, validateForm]);

  const openEditModal = (task: Task) => {
    setModalFormData({
      taskTitle: task.taskTitle || "",
      taskType: task.taskType || "",
      description: task.description || "",
      date: task.date ? task.date.split("T")[0] : "",
      time: task.time || "",
      volunteer: task.volunteers
        ? task.volunteers
            .map((vol) => vol.user?._id)
            .filter((id): id is string => Boolean(id))
        : [],
      address: task.address || "",
      status: task.status || "pending",
    });
    setModalMode("edit");
    setEditTaskId(task._id);
    setShowModal(true);
  };

  const filteredTasks = displayTasks.filter((task) => {
    const matchStatus = filters.status ? task.status === filters.status : true;
    return matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assigned Tasks</h1>
        <div>
          <label className="block text-sm font-medium text-gray-700 ">
            Filter by Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => {
            setModalMode("create");
            setModalFormData(initialFormData);
            setShowModal(true);
            setFormErrors({});
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Create new task"
        >
          + Create Task
        </button>
      </header>

      {loading ? (
        <p className="text-center text-gray-600" aria-live="polite">
          Loading tasks...
        </p>
      ) : filters.status && filteredTasks.length === 0 ? (
        <p className="text-center text-red-500" aria-live="polite">
          {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)} {""}
          Tasks not found.
        </p>
      ) : displayTasks.length === 0 ? (
        <p className="text-gray-500 text-center" aria-live="polite">
          No tasks found.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={openEditModal}
              onDelete={() => {
                setShowConfirmModal(true);
                setTaskToDelete(task);
              }}
              isDeleting={taskLoading[task._id] || false}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <button
              onClick={() => {
                setShowModal(false);
                setModalMode("create");
                setEditTaskId(null);
                setModalFormData(initialFormData);
                setFormErrors({});
              }}
              className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close modal"
            >
              ×
            </button>
            <h2
              id="modal-title"
              className="text-xl font-bold text-blue-700 mb-4"
            >
              {modalMode === "create"
                ? "Create Volunteer Task"
                : "Edit Volunteer Task"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Task Title"
                field="taskTitle"
                required
                value={modalFormData.taskTitle}
                onChange={handleChange}
                error={formErrors.taskTitle}
              />
              <InputField
                label="Task Type"
                field="taskType"
                required
                value={modalFormData.taskType}
                onChange={handleChange}
                error={formErrors.taskType}
              />
              <InputField
                label="Description"
                field="description"
                required
                value={modalFormData.description}
                onChange={handleChange}
                error={formErrors.description}
              />
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={dateTime}
                  onChange={handleDateTimeChange}
                  showTimeSelect
                  dateFormat="dd-MMM-yyyy h:mm aa"
                  minDate={new Date()}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                    formErrors.date || formErrors.time
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholderText="Select date and time"
                />
                {(formErrors.date || formErrors.time) && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.date || formErrors.time}
                  </p>
                )}
              </div>
              <VolunteerSelect
                value={modalFormData.volunteer}
                onChange={(e) =>
                  setModalFormData((prev) => ({
                    ...prev,
                    volunteer: e.target.value,
                  }))
                }
                volunteers={volunteers}
                error={formErrors.volunteer}
              />

              <InputField
                label="Address"
                field="address"
                required
                value={modalFormData.address}
                onChange={handleChange}
                error={formErrors.address}
              />
              <StatusSelect
                value={modalFormData.status}
                onChange={handleChange}
                error={formErrors.status}
                disabled={["completed", "cancelled"].includes(
                  modalFormData.status
                )}
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalMode("create");
                  setEditTaskId(null);
                  setModalFormData(initialFormData);
                  setFormErrors({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cancel task creation"
              >
                Cancel
              </button>
              {modalFormData.status !== "completed" && (
                <button
                  onClick={
                    modalMode === "create" ? handleCreateTask : handleEditTask
                  }
                  disabled={isCreating || isEditing}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isCreating || isEditing
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  aria-label={
                    modalMode === "create" ? "Create task" : "Update task"
                  }
                >
                  {isCreating && modalMode === "create" ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : isEditing && modalMode === "edit" ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : modalMode === "create" ? (
                    "Create Task"
                  ) : (
                    "Update Task"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the task{" "}
              <span className="font-medium text-red-600">
                {taskToDelete.taskTitle}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDeleteTask(taskToDelete._id);
                  setShowConfirmModal(false);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;
