import "./App.css";
import React, { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "./authContext/Auth";
import ResetPassword from "./pages/home/ResetPassword";
import CompleteProfile from "./pages/home/CompleteProfile";
import DonationDetailPage from "./pages/User/DonationDetailPage";
import GaudaanDetailPage from "./pages/User/GaudaanDetailPage";
import GreenSortsData from "./pages/GreenSorts/GreenSortsData";

// Lazy-loaded components
const VolunteersData = lazy(() => import("./pages/Admin/VolunteersData"));
const LogoUpload = lazy(() => import("./pages/Admin/LogoUpload"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));
const MainLayout = lazy(() => import("./components/MainLayout"));
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const Notifications = lazy(() => import("./components/Notifications"));
const Signup = lazy(() => import("./pages/home/Signup"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const PickupRequest = lazy(() => import("./pages/Admin/PickupRequest"));
const DonationDetail = lazy(() => import("./pages/Admin/DonationDetail"));
const TaskDetails = lazy(() => import("./pages/Admin/TaskDetails"));
const HistoryData = lazy(() => import("./pages/Admin/HistoryData"));
const GaudaanData = lazy(() => import("./pages/Admin/GaudaanData"));
const GaudaanById = lazy(() => import("./pages/Admin/GaudaanById"));
const UsersData = lazy(() => import("./pages/Admin/UsersData"));
const DealersData = lazy(() => import("./pages/Admin/DealersData"));
const SheltersDetails = lazy(() => import("./pages/Admin/SheltersDetails"));
const ContactsPage = lazy(() => import("./pages/Admin/ContactsPage"));
const TaskDetail = lazy(() => import("./pages/Admin/TaskDetail"));
const NotFound = lazy(() => import("./pages/home/NotFound"));

const Home = lazy(() => import("./pages/home/Home"));
const About = lazy(() => import("./pages/home/About"));
const Service = lazy(() => import("./pages/home/Service"));
const DownloadSection = lazy(() => import("./pages/home/DownloadSection"));
const Contact = lazy(() => import("./pages/home/Contact"));
const HowItWorks = lazy(() => import("./pages/home/HowItWorks"));
const Login = lazy(() => import("./pages/home/Login"));
const ForgotPassword = lazy(() => import("./pages/home/ForgotPassword"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));

const VolunteerSignup = lazy(() => import("./pages/Volunteer/VolunteerSignup"));
const VolunteerDashboard = lazy(
  () => import("./pages/Volunteer/VolunteerDashboard")
);
const TasksDetails = lazy(() => import("./pages/Volunteer/TasksDetails"));
const VolunteerGaudaan = lazy(
  () => import("./pages/Volunteer/VolunteerGaudaan")
);
const GaudaanPickEdit = lazy(() => import("./pages/Volunteer/GaudaanPickEdit"));

const DealerSignup = lazy(() => import("./pages/home/DealerSignup"));
const DealerDashboard = lazy(() => import("./pages/Dealer/DealerDashboard"));
const PickupDetail = lazy(() => import("./pages/Dealer/PickupDetail"));
const UpcomingPickup = lazy(() => import("./pages/Dealer/UpcomingPickup"));
const HistoryPickup = lazy(() => import("./pages/Dealer/HistoryPickup"));
const DonatedList = lazy(() => import("./pages/Dealer/DonatedList"));

const GreenSortsSignup = lazy(
  () => import("./pages/GreenSorts/GreenSortsSignup")
);
const GreenSortsDashboard = lazy(
  () => import("./pages/GreenSorts/GreenSortsDashboard")
);
const RecycledData = lazy(() => import("./pages/GreenSorts/RecycledData"));

const DonationsDetails = lazy(() => import("./pages/User/DonationDetails"));
const UserDashboard = lazy(() => import("./pages/User/UserDashboard"));
const GaudaanDetails = lazy(() => import("./pages/User/GaudaanDetails"));
const CreateGaudaan = lazy(() => import("./pages/User/CreateGaudaan"));
const Settings = lazy(() => import("./pages/home/Settings"));

// Define types for useAuth hook
interface AuthContextType {
  isAuthenticated: boolean;
  authorizationToken?: string | null;
  logout?: () => void;
  user?: { _id?: string; roles?: string[] } | null;
}

// Define props for PrivateRoute
interface PrivateRouteProps {
  allowedRoles?: string[];
  children: React.ReactElement;
}

const App: React.FC = () => {
  const { isAuthenticated } = useAuth() as AuthContextType;

  const CowLoader: React.FC = () => {
    useEffect(() => {
      const interval = setInterval(() => {}, 5000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-green-800 animate-fadeIn">
        <img
          src="/images/cow_loader.gif"
          alt="Loading..."
          className="w-48 h-44 mb-4 animate-bounce"
        />
        <p className="text-lg font-semibold text-green-800">
          Gau Seva in progress... please wait
        </p>
      </div>
    );
  };

  return (
    <div className="w-[100vw]">
      {!isAuthenticated && <Navbar />}

      <Suspense fallback={<CowLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/services" element={<Service />} />
          <Route path="/download-section" element={<DownloadSection />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/GreenSorts" element={<GreenSortsSignup />} />

          {/* Reset Password */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Volunteers */}
          <Route path="/volunteer-signup" element={<VolunteerSignup />} />
          <Route
            path="/volunteer-dashboard"
            element={
              <PrivateRoute allowedRoles={["volunteer"]}>
                <MainLayout>
                  <VolunteerDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tasksdetails"
            element={
              <PrivateRoute allowedRoles={["volunteer"]}>
                <MainLayout>
                  <TasksDetails />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/assignedgaudaan"
            element={
              <PrivateRoute allowedRoles={["volunteer"]}>
                <MainLayout>
                  <VolunteerGaudaan />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/gaudaanPick/:id"
            element={
              <PrivateRoute allowedRoles={["volunteer"]}>
                <MainLayout>
                  <GaudaanPickEdit />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* User */}
          <Route
            path="/donationdetails"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <MainLayout>
                  <DonationsDetails />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <MainLayout>
                  <UserDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/gaudaan-details"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <MainLayout>
                  <GaudaanDetails />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/create-gaudaan"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <MainLayout>
                  <CreateGaudaan />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/donation/:id"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <MainLayout>
                  <DonationDetailPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/gaudaan/:id"
            element={
              <PrivateRoute>
                <MainLayout>
                  <GaudaanDetailPage />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Dealers */}
          <Route path="/dealer" element={<DealerSignup />} />
          <Route
            path="/dealer-dashboard"
            element={
              <PrivateRoute allowedRoles={["dealer"]}>
                <MainLayout>
                  <DealerDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pickup/:id"
            element={
              <PrivateRoute allowedRoles={["dealer"]}>
                <MainLayout>
                  <PickupDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pickupsdata"
            element={
              <PrivateRoute allowedRoles={["dealer"]}>
                <MainLayout>
                  <UpcomingPickup />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/historydata"
            element={
              <PrivateRoute allowedRoles={["dealer"]}>
                <MainLayout>
                  <HistoryPickup />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/doantedlist"
            element={
              <PrivateRoute allowedRoles={["dealer"]}>
                <MainLayout>
                  <DonatedList />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Recycler */}
          <Route
            path="/greensorts-dashboard"
            element={
              <PrivateRoute allowedRoles={["recycler"]}>
                <MainLayout>
                  <GreenSortsDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/processedData"
            element={
              <PrivateRoute allowedRoles={["recycler"]}>
                <MainLayout>
                  <GreenSortsData />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/recycleddata"
            element={
              <PrivateRoute allowedRoles={["recycler"]}>
                <MainLayout>
                  <RecycledData />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pickupRequest"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <PickupRequest />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pickups/:id"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <DonationDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <TaskDetails />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <TaskDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <HistoryData />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/gaudaan"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <GaudaanData />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/gaudaans/:id"
            element={
              <PrivateRoute>
                <MainLayout>
                  <GaudaanById />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <UsersData />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/volunteers"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <VolunteersData />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/dealers"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <DealersData />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/shelters"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <SheltersDetails />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <ContactsPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/logoupload"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <LogoUpload />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route path="/complete-profile/:id" element={<CompleteProfile />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {!isAuthenticated && <Footer />}
    </div>
  );
};

export default App;
