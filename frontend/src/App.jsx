import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getMe } from "./api/userApi";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import HouseholdSetupPage from "./pages/HouseholdSetupPage";
import MorePage from "./pages/MorePage";
import TodayPage from "./pages/TodayPage";
import SwipePlannerPage from './pages/SwipePlannerPage';
import PlanPage from './pages/PlanPage'
import ShoppingPage from './pages/ShoppingPage'
import MobileBottomNav from "./components/MobileBottomNav"


function SettingsPage() {
  return <div className="p-6">Einstellungen</div>;
}

function FamilyPage() {
  return <div className="p-6">Familie verwalten</div>;
}

function HelpPage() {
  return <div className="p-6">Hilfe</div>;
}

function NotificationSettingsPage() {
  return <div className="p-6">Benachrichtigungen</div>;
}



export default function App() {
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
        console.log("APP USER:", me);
        setUser(me);
      } catch (err) {
        console.error("GET ME ERROR:", err);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  function handleAuthSuccess(nextToken) {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
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

return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-24">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/swipe" element={<SwipePlannerPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
        </Routes>
      </main>

      <MobileBottomNav />
    </div>
);
}