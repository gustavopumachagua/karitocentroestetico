import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/auth/Login";
import Home from "./components/Home/Home";
import NavbarFooterLayout from "./layout/NavbarFooterLayout";
import Newpassword from "./pages/auth/Newpassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Doctor from "./layout/DoctorLayout";
import AdminLayout from "./layout/AdminLayout";
import CosmeatraRecepcionistaLayout from "./layout/CosmiatraLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import OfflineAlert from "./components/OfflineAlert/OfflineAlert";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <OfflineAlert />
      <Routes>
        <Route
          path="/"
          element={
            <NavbarFooterLayout>
              <Home />
            </NavbarFooterLayout>
          }
        />

        <Route
          path="/login"
          element={
            <NavbarFooterLayout>
              <Login onLogin={() => setIsAuthenticated(true)} />
            </NavbarFooterLayout>
          }
        />

        <Route
          path="/reset-password"
          element={
            <NavbarFooterLayout>
              <ResetPassword />
            </NavbarFooterLayout>
          }
        />

        <Route
          path="/new-password"
          element={
            <NavbarFooterLayout>
              <Newpassword />
            </NavbarFooterLayout>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/administrador/*" element={<AdminLayout />} />
          <Route path="/doctor/*" element={<Doctor />} />
          <Route
            path="/cosmiatra/*"
            element={<CosmeatraRecepcionistaLayout />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
