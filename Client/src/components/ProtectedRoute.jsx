import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const ProtectedRoute = () => {
  // Evaluated fresh whenever any protected route is accessed
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute;