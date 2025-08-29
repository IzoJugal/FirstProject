import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { useAuth } from "../../authContext/Auth";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

// Define interfaces for data structures
interface User {
  firstName: string;
  phone: string;
  profileImage?: string;
}

interface Volunteer {
  user: User | null;
}

interface Task {
  _id: string;
  taskTitle: string;
  taskType: string;
  status: string;
  date: string;
  volunteers: Volunteer[];
}

interface AuthContext {
  authorizationToken: string;
}

interface TaskResponse {
  task: Task;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { authorizationToken } = useAuth() as AuthContext;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchTask = useCallback(async () => {
    try {
      const res: AxiosResponse<TaskResponse> = await axios.get(
        `${import.meta.env.VITE_BACK_URL}/admin/task/${id}`,
        {
          headers: { Authorization: authorizationToken },
        }
      );
      setTask(res.data.task);
    } catch (err) {
      toast.error("Failed to fetch task details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authorizationToken, id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">Loading task details...</p>
    );
  }

  if (!task) {
    return <p className="text-center mt-10 text-red-500">Task not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        {task.taskTitle}
      </h1>

      <p className="text-sm text-gray-600 mb-2">
        <strong>Status:</strong> {task.status}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Type:</strong> {task.taskType}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        <strong>Date:</strong>{" "}
        {new Date(task.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Assigned Volunteers</h2>
      {task.volunteers &&
      task.volunteers.filter((vol) => vol.user).length > 0 ? (
        <ul className="space-y-2">
          {task.volunteers
            .filter(
              (vol): vol is Volunteer & { user: User } => vol.user !== null
            )
            .map((vol, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <img
                  src={
                    vol.user.profileImage
                      ? `${import.meta.env.VITE_BACK_URL}/auth/profile/image/${
                          vol.user.profileImage
                        }`
                      : "img/profile-image.webp"
                  }
                  alt={vol.user.firstName}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm text-gray-700">
                  {vol.user.firstName} - ({vol.user.phone})
                </span>
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No volunteers assigned</p>
      )}

      <div className="flex justify-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-lg text-blue-700 bg-gray-300 rounded-2xl p-3 font-semibold"
        >
          <ArrowLeft className="mr-1" size={24} />
          Back
        </button>
      </div>
    </div>
  );
};

export default TaskDetail;
