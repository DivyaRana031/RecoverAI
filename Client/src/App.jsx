import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Recovery from "./pages/Recovery";
import AIDecisions from "./pages/AIDecisions";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logs from "./pages/Logs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
                  <Route
  path="/signup"
  element={<Signup />}
/>
        {/* Protected App Routes (Shared Sidebar Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/ai-decisions" element={<AIDecisions />} />
           <Route path="/logs" element={<Logs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
