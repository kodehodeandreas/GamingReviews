import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../auth";

function ProtectedRoute({ children }) {
  if (isTokenExpired()) {
    localStorage.removeItem("token");
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
