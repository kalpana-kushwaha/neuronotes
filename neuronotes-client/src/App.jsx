import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useThemeMode } from "./contexts/ThemeContext"; // ✅ Import hook
import { Button } from "@mui/material";

import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import EditNote from './pages/EditNote';
import ViewNote from './pages/ViewNote';

function App() {
  const { toggleTheme, mode } = useThemeMode(); // ✅ Access context

  return (
    <Router>
      <nav
        style={{
          padding: "1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          background: mode === "dark" ? "#222" : "#eee",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">Home</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/search">Search</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <Button
          onClick={toggleTheme}
          variant="outlined"
          color="inherit"
          size="small"
        >
          {mode === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </Button>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/search" element={<Search />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit/:id" element={<EditNote />} />
        <Route path="/note/:id" element={<ViewNote />} />
      </Routes>
    </Router>
  );
}

export default App;
