import "./App.css";
import Featured from "./pages/Featured";
import Calendar from "./pages/Calendar";
import ManualCollection from "./pages/ManualCollection";

function App() {
  return (
    <div>
      <h1>🎙️ 推し活マネージャー</h1>

      <Featured />

      <hr />

      <Calendar />

      <hr />

      <ManualCollection />
    </div>
  );
}

export default App;