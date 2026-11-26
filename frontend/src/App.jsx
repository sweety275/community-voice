import { Routes, Route, Link, Navigate } from "react-router-dom";
import Registration from "./Pages/Registration.jsx";
import "./App.css";
import Login from "./Pages/Login.jsx";
import RaiseConcern from "./Pages/RaiseConcern.jsx";
import Dashboard from "./Pages/Dashboard.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Home() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">Community Voice</h2>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
        </div>
        <div className="nav-buttons">
          <Link to="/login"><button className="-btn">Login</button></Link>
          <Link to="/register"><button className="register-btn">Register</button></Link>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <p className="tagline">A COMMUNITY WHERE EVERY VOICE MATTERS</p>
        <h1>Every Voice Matters.<br />Every Concern Deserves Action.</h1>
        <p className="hero-description">
          A safe and supportive platform where students can share
          concerns, report problems, and suggest improvements.
        </p>
        <Link to="/raise-concern">
          <button className="raise-btn">Raise a Concern</button>
        </Link>
      </section>

      <section className="about-section" id="about">
        <h2>About Community Voice</h2>
        <p>
          Community Voice connects students, concern handlers,
          and associates to make our community better.
          Everyone deserves to be heard and supported.
        </p>
      </section>

      <section className="features-section" id="features">
        <h2>What You Can Do</h2>
        <div className="feature-container">
          <div className="feature-card">
            <h3>Raise Concerns</h3>
            <p>Share your problems safely and easily.</p>
          </div>
          <div className="feature-card">
            <h3>Track Progress</h3>
            <p>Check updates and follow your concern.</p>
          </div>
          <div className="feature-card">
            <h3>Share Suggestions</h3>
            <p>Share ideas to improve the community.</p>
          </div>
        </div>
      </section>

      <footer>
        <p>Community Voice © 2026. Every Voice Matters.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/raise-concern" element={<RaiseConcern />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<Registration />} />
    </Routes>
  );
}

export default App;
