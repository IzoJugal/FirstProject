import { Navigate } from "react-router-dom";
import {useAuth} from "../authContext/Auth";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { token, user,logout } = useAuth();
  if (!token) {
    logout();
      return <Navigate to="/" replace />;
   
  }

  // Optional: restrict based on role
  if (allowedRoles && !allowedRoles.some(role => user?.roles?.includes(role))) {
     logout();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
