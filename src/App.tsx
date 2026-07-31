import { useEffect, useState } from "react";
import "./App.css";
import Menu from "./components/Menu";
import Calendar from "./pages/Calendar";
import Ticket from "./pages/Ticket";
import Media from "./pages/Media";
import Favorite from "./pages/Favorite";
import Settings from "./pages/Settings";
import EventDetail from "./pages/EventDetail";


function App() {
  const [currentPage, setCurrentPage] = useState("calendar");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  return (
    <div className="app">
      <h1 className="title">🎤 推し活マネージャー</h1>

      <hr />
      <Menu onSelectPage={setCurrentPage} />
      {currentPage === "calendar" && <Calendar />}
      {currentPage === "ticket" && <Ticket />}
      {currentPage === "media" && <Media />}
      {currentPage === "favorite" && <Favorite />}
      {currentPage === "settings" && <Settings />}
    </div>
  );
}


export default App
