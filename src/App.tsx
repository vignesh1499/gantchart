import "./App.css";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import GanttChart from "./component/GanttChart/GanttChart";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./component/Login/Login";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chart" element={<GanttChart />} />
      </Routes>
      <ToastContainer />
    </Provider>
  );
}

export default App;
