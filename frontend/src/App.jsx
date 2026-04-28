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

function getStoredToken() {
  return localStorage.getItem("token");
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!token) {
        if (!isMounted) return;
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const me = await getMe();
        if (!isMounted) return;
        setUser(me);
      } catch (err) {
        console.error("GET ME ERROR:", err);
        localStorage.removeItem("token");
        if (!isMounted) return;
        setToken(null);
        setUser(null);
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
  }, [token]);

  function handleAuthSuccess(nextToken) {
    if (!nextToken) return;

    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    navigate("/", { replace: true });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("mealplan_token");

    setToken(null);
    setUser(null);
    setIsLoading(false);

    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return <div className="p-6">Lädt...</div>;
  }

  if (!isAuthenticated) {
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
            <Route path="/" element={<TodayPage />} />
            <Route path="/swipe" element={<SwipePlannerPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route
              path="/settings/notifications"
              element={<NotificationSettingsPage />}
            />
            <Route path="/more/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isRecipeDetailPage ? <MobileBottomNav onLogout={handleLogout} /> : null}
    </div>
  );
}
