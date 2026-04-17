import { Route, Routes } from "react-router-dom";
import MobileBottomNav from "./components/MobileBottomNav";
import MorePage from "./pages/MorePage";
import PlanPage from "./pages/PlanPage";
import ShoppingPage from "./pages/ShoppingPage";
import SwipePlannerPage from "./pages/SwipePlannerPage";
import TodayPage from "./pages/TodayPage";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-24">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/swipe" element={<SwipePlannerPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/more" element={<MorePage />} />
        </Routes>
      </main>

      <MobileBottomNav />
    </div>
  );
}

export default App;