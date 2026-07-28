import { useState } from "react";
import "./App.css";
import Menu from "./components/Menu";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Ticket from "./pages/Ticket";
import Media from "./pages/Media";
import Favorite from "./pages/Favorite";
import Settings from "./pages/Settings";

function App() {
  const [currentPage, setCurrentPage] = useState("calendar");
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
