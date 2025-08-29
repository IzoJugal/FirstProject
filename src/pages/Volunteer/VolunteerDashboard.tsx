import React, { useEffect, useState } from "react";
import { Handshake, CalendarCheck, Truck, CalendarDays, Clock, MapPin } from "lucide-react";
import { useAuth } from "../../authContext/Auth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

// Define interfaces for type safety
interface User {
  name: string;
}

interface Task {
  _id: string;
  taskTitle: string;
  taskType: string;
  date: string;
  address: string;
  status: string;
}

interface Counts {
  pending: number;
  active: number;
  completed: number;
}

interface Stats {
  counts: Counts;
  todayTasks: Task[];
}

interface AuthContext {
  user: User | null;
  authorizationToken: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const VolunteerDashboard: React.FC = () => {
  const { authorizationToken, user } = useAuth() as AuthContext;
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    counts: {
      pending: 0,
      active: 0,
      completed: 0,
    },
    todayTasks: [],
  });

  const limitedTasks = stats.todayTasks.slice(0, 3);
  const hasMoreTasks = stats.todayTasks.length > 3;

  useEffect(() => {
    const fetchStatsAndTasks = async (): Promise<void> => {
      try {
        const [countRes, tasksRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACK_URL}/auth/volunteer-tasks/count-by-status`, {
            headers: { Authorization: authorizationToken },
          }),
          fetch(`${import.meta.env.VITE_BACK_URL}/auth/tasks`, {
            headers: { Authorization: authorizationToken },
          }),
        ]);

        if (!countRes.ok || !tasksRes.ok) throw new Error("Failed to fetch data");

        const countData: { counts: Counts } = await countRes.json();
        const taskData: { tasks: Task[] } = await tasksRes.json();

        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istTodayStr = new Date(Date.now() + istOffsetMs).toISOString().split("T")[0];

        const todayTasks = (taskData.tasks || []).filter((task) => {
          const taskIST = new Date(new Date(task.date).getTime() + istOffsetMs)
            .toISOString()
            .split("T")[0];
          return taskIST === istTodayStr;
        });

        setStats({
          counts: countData.counts || { pending: 0, active: 0, completed: 0 },
          todayTasks,
        });
      } catch (err: any) {
        console.error("Failed to fetch volunteer dashboard data:", err);
      }
    };

    if (authorizationToken) {
      fetchStatsAndTasks();
    }
  }, [authorizationToken]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {user?.name ?? "Volunteer"}👋 </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Assigned Tasks"
          value={stats.counts.pending ?? 0}
          icon={<Handshake className="text-blue-600" />}
        />
        <StatCard
          title="In Progress"
          value={stats.counts.active ?? 0}
          icon={<CalendarCheck className="text-green-600" />}
        />
        <StatCard
          title="Completed"
          value={stats.counts.completed ?? 0}
          icon={<Truck className="text-yellow-600" />}
        />
      </div>

      {/* Recent Activity / Tasks */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Today’s Tasks</h2>
        <ul className="text-sm space-y-2 text-gray-700">
          {limitedTasks.length > 0 ? (
            limitedTasks.map((task) => {
              const taskDateIST = dayjs.utc(task.date).tz("Asia/Kolkata");
              const formattedDate = taskDateIST.format("D MMMM YYYY");
              const formattedTime = taskDateIST.format("hh:mm A");

              return (
                <li
                  key={task._id}
                  className="p-4 border rounded-xl bg-gray-50 shadow-sm space-y-1"
                >
                  <p className="font-semibold text-base">
                    {task.taskTitle} - {task.taskType}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {task.address}
                  </p>
                  <p className="text-gray-500 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> {formattedDate}
                    <Clock className="w-4 h-4 ml-4" /> {formattedTime} •{" "}
                    <span className="capitalize">{task.status}</span>
                  </p>
                </li>
              );
            })
          ) : (
            <li className="text-gray-500 italic">No tasks scheduled for today.</li>
          )}
        </ul>

        {hasMoreTasks && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/tasksdetails")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View More Tasks →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;