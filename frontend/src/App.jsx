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
import ChangelogPage from "./pages/ChangelogPage";

const AUTH_TOKEN_KEY = "token";
const LEGACY_AUTH_TOKEN_KEY = "mealplan_token";

function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
}

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
}

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const currentToken = getStoredToken();

      if (!currentToken) {
        clearAuthStorage();
        if (!isMounted) return;
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Falls noch ein alter Key existiert, vereinheitlichen wir sauber auf "token".
      if (currentToken !== localStorage.getItem(AUTH_TOKEN_KEY)) {
        localStorage.setItem(AUTH_TOKEN_KEY, currentToken);
        localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
      }

      if (!isMounted) return;
      setIsLoading(true);

      try {
        const me = await getMe();
        const normalizedUser = me?.user ?? me;

        if (!normalizedUser) {
          throw new Error("Kein Benutzerprofil erhalten.");
        }

        if (!isMounted) return;
        setToken(currentToken);
        setUser(normalizedUser);
      } catch (err) {
        console.error("GET ME ERROR:", err);
        clearAuthStorage();

        if (!isMounted) return;
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  function handleAuthSuccess(nextToken) {
    if (!nextToken) return;

    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    setToken(nextToken);
    navigate("/", { replace: true });
  }

  function handleLogout() {
    clearAuthStorage();
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
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isRecipeDetailPage ? <MobileBottomNav onLogout={handleLogout} /> : null}
    </div>
  );
}
