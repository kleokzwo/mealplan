import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { getMe } from "./api/userApi";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import HouseholdSetupPage from "./pages/HouseholdSetupPage";
import MorePage from "./pages/MorePage";
import TodayPage from "./pages/TodayPage";
import SwipePlannerPage from "./pages/SwipePlannerPage";
import PlanPage from "./pages/PlanPage";
import ShoppingPage from "./pages/ShoppingPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import MobileBottomNav from "./components/MobileBottomNav";
import SettingsPage from "./pages/SettingsPage";
import FamilyPage from "./pages/FamilyPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import PrivacyPage from "./pages/PrivacyPage";

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        console.error("GET ME ERROR:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("mealplan_token");
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token, navigate]);

  function handleAuthSuccess(nextToken) {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    navigate("/", { replace: true });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("mealplan_token");

    setToken(null);
    setUser(null);

    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return <div className="p-6">Lädt...</div>;
  }

  if (!token) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage onAuthSuccess={handleAuthSuccess} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user && !user.onboardingCompleted) {
    return (
      <Routes>
        <Route path="/onboarding/household" element={<HouseholdSetupPage />} />
        <Route path="*" element={<Navigate to="/onboarding/household" replace />} />
      </Routes>
    );
  }

  const isRecipeDetailPage = location.pathname.startsWith("/recipe/");

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-24">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <ProtectedRoute token={token}>
                  <TodayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/swipe"
              element={
                <ProtectedRoute token={token}>
                  <SwipePlannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan"
              element={
                <ProtectedRoute token={token}>
                  <PlanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopping"
              element={
                <ProtectedRoute token={token}>
                  <ShoppingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/more"
              element={
                <ProtectedRoute token={token}>
                  <MorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipe/:id"
              element={
                <ProtectedRoute token={token}>
                  <RecipeDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute token={token}>
                  <SettingsPage onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/family"
              element={
                <ProtectedRoute token={token}>
                  <FamilyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute token={token}>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/more/privacy"
              element={
                <ProtectedRoute token={token}>
                  <PrivacyPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isRecipeDetailPage ? <MobileBottomNav onLogout={handleLogout} /> : null}
    </div>
  );
}
