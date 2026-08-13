import { useState } from "react";
import "./App.css";
import Menu from "./components/Menu";
import Calendar from "./pages/Calendar";
import ManualCollection from "./pages/ManualCollection";
import Ticket from "./pages/Ticket";
import Media from "./pages/Media";
import Favorite from "./pages/Favorite";
import Settings from "./pages/Settings";

function App() {
  const [currentPage, setCurrentPage] = useState("calendar");

  return (
    <div>
      🎙️ 推し活マネージャー

      <hr />

      <Menu onSelectPage={setCurrentPage} />

      {currentPage === "calendar" && <Calendar />}

      {currentPage === "manualCollection" && (
        <ManualCollection onNavigate={setCurrentPage} />
      )}

      {currentPage === "ticket" && <Ticket />}
      {currentPage === "media" && <Media />}
      {currentPage === "favorite" && <Favorite />}
      {currentPage === "settings" && <Settings />}
    </div>
  );
}

export default App;