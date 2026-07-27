import { useState } from "react";
import "./App.css";
import Menu from "./components/Menu";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Ticket from "./pages/Ticket";


function App() {
  const [currentPage, setCurrentPage] = useState("calendar");
  return (
    <div className="app">
      <h1 className="title">🎤 推し活マネージャー</h1>

      <hr />
      <Menu onSelectPage={setCurrentPage} />
      {currentPage === "calendar" && <Calendar />}
      {currentPage === "ticket" && <Ticket />}
    </div>
  );
}


export default App
