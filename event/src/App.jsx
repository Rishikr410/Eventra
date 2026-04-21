import "./App.css";
import { useEffect } from "react";

import { useApp } from "./context/AppContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Events from "./pages/Events";
import Calendar from "./pages/Calendar";
import QnA from "./pages/QnA";
import Notes from "./pages/Notes";
import Poll from "./pages/Poll";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {
  const { user, darkMode } = useApp();

  useEffect(() => {
    // Theme switch ko HTML level par set kar raha hu so CSS and Bootstrap dono sync rahein.
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    document.documentElement.setAttribute("data-bs-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  if (!user) {
    // Login ke bina user sirf auth route hi dekh sake, baki sab redirect ho jaye.
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Header />
          <main className="content-scroll">
            {/* Protected app routes login ke baad yahi render ho rahe hain. */}
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/events" element={<Events />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/qna" element={<QnA />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/poll" element={<Poll />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Footer />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
