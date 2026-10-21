import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container page">
        <div className="loading">
          <div className="spinner"></div>
          Loading your account...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
