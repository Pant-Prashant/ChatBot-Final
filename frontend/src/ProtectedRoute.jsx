import { Navigate } from "react-router-dom";

function ProtectedRoute({ username, children }) {
  if (!username) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
