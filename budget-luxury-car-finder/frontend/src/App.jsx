import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AddCarForm from "./components/AddCarForm.jsx";
import CompareCars from "./components/CompareCars.jsx";
import Recommendations from "./components/Recommendations.jsx";
import AvoidList from "./components/AvoidList.jsx";

const pages = {
  dashboard: "Dashboard",
  add: "Add car",
  compare: "Compare",
  recommendations: "Recommendations",
  avoid: "Avoid list",
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleCarSaved() {
    setRefreshKey((key) => key + 1);
    setActivePage("dashboard");
  }

  return (
    <div className="app-shell">
      <Navbar pages={pages} activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        {activePage === "dashboard" && (
          <Dashboard refreshKey={refreshKey} onAddCar={() => setActivePage("add")} />
        )}
        {activePage === "add" && <AddCarForm onSaved={handleCarSaved} />}
        {activePage === "compare" && <CompareCars refreshKey={refreshKey} />}
        {activePage === "recommendations" && <Recommendations />}
        {activePage === "avoid" && <AvoidList />}
      </main>
    </div>
  );
}
