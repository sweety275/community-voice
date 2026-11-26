import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackedConcern, setTrackedConcern] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/concerns/my-concerns",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch concerns.");
        }

        setConcerns(data.concerns || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, []);


  const handleTrackConcern = async (e) => {
    e.preventDefault();
    setTrackingError("");
    setTrackedConcern(null);
    setTrackingLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/concerns/anonymous/track",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trackingCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to track concern.");
      }

      setTrackedConcern(data.concern);
    } catch (err) {
      setTrackingError(err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleDeleteConcern = async (concernId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this concern?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/concerns/${concernId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete concern.");
      }

      setConcerns((previous) =>
        previous.filter((concern) => concern._id !== concernId)
      );

      if (selectedConcern?._id === concernId) {
        setSelectedConcern(null);
      }

      window.alert("Concern deleted successfully.");
    } catch (err) {
      window.alert(err.message);
    }
  };

  const pendingCount = concerns.filter(
    (c) => c.status !== "Resolved" && c.status !== "Closed"
  ).length;

  const resolvedCount = concerns.filter(
    (c) => c.status === "Resolved" || c.status === "Closed"
  ).length;

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <h2>Community Voice</h2>
        <div>
          <Link to="/">Home</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Student Dashboard</h1>
        <p>Welcome to your Community Voice dashboard!</p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Concerns</h3>
            <h2>{loading ? "..." : concerns.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Pending Concerns</h3>
            <h2>{loading ? "..." : pendingCount}</h2>
          </div>

          <div className="stat-card">
            <h3>Resolved Concerns</h3>
            <h2>{loading ? "..." : resolvedCount}</h2>
          </div>
        </div>

        <div className="anonymous-tracking-section">
          <h2>Track Anonymous Concern</h2>
          <p>Enter your private tracking code to check your concern status.</p>

          <form onSubmit={handleTrackConcern}>
            <input
              type="text"
              placeholder="Enter your tracking code"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              required
            />
            <button type="submit" disabled={trackingLoading}>
              {trackingLoading ? "Tracking..." : "Track Concern"}
            </button>
          </form>

          {trackingError && <p className="tracking-error">{trackingError}</p>}
        </div>

        {trackedConcern && (
          <div className="tracked-concern-card">
            <h3>{trackedConcern.title}</h3>
            <p><strong>Category:</strong> {trackedConcern.category}</p>
            <p><strong>Current Status:</strong> {trackedConcern.status}</p>
            <p><strong>Priority:</strong> {trackedConcern.priority}</p>
            <p><strong>Campus:</strong> {trackedConcern.campus}</p>

            <div className="tracking-timeline">
              <h3>Concern Tracking Timeline</h3>
              {(trackedConcern.statusHistory || []).map((item, index) => (
                <div className="timeline-item completed" key={index}>
                  <span className="timeline-dot"></span>
                  <div>
                    <p><strong>{item.status}</strong></p>
                    {item.note && <p>{item.note}</p>}
                    <small>{new Date(item.updatedAt).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setTrackedConcern(null)}>
              Close Details
            </button>
          </div>
        )}

        <div className="recent-concerns">
          <h2>My Recent Concerns</h2>

          {loading && <p>Loading your concerns...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && concerns.length === 0 && (
            <p>You have not submitted any concerns yet.</p>
          )}

          {!loading && !error && concerns.map((concern) => (
            <div className="concern-card" key={concern._id}>
              <h3>{concern.title}</h3>
              <p>Category: {concern.category}</p>
              <p>
                Status:{" "}
                <span
                  className={`status-badge status-${concern.status
                    .toLowerCase()
                    .replace(/\\s+/g, "-")}`}
                >
                  {concern.status}
                </span>
              </p>
              <p>Priority: {concern.priority}</p>

              <button
                className="view-details-btn"
                onClick={() => setSelectedConcern(concern)}
              >
                View Details
              </button>

              <button
                className="delete-concern-btn"
                onClick={() => handleDeleteConcern(concern._id)}
              >
                Delete Concern
              </button>
            </div>
          ))}

          <Link to="/raise-concern">
            <button>Raise a New Concern</button>
          </Link>
        </div>

        {selectedConcern && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedConcern(null)}
          >
            <div
              className="details-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <h2>Full Concern Details</h2>
              <h3>{selectedConcern.title}</h3>
              <p><strong>Description:</strong> {selectedConcern.description}</p>
              <p><strong>Category:</strong> {selectedConcern.category}</p>
              <p><strong>Campus:</strong> {selectedConcern.campus}</p>
              <p><strong>House:</strong> {selectedConcern.house || "Not specified"}</p>
              <p><strong>Reporting Mode:</strong> {selectedConcern.reportingMode}</p>
              <p><strong>Submitted:</strong> {new Date(selectedConcern.createdAt).toLocaleString()}</p>
              <p><strong>Current Status:</strong> {selectedConcern.status}</p>
              <p><strong>Priority:</strong> {selectedConcern.priority}</p>

              <div className="tracking-timeline">
                <h3>Concern Tracking Timeline</h3>

                {(selectedConcern.statusHistory || []).map((item, index) => (
                  <div className="timeline-item completed" key={index}>
                    <span className="timeline-dot"></span>
                    <div>
                      <p><strong>{item.status}</strong></p>
                      {item.note && <p>{item.note}</p>}
                      <small>
                        {new Date(item.updatedAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setSelectedConcern(null)}>
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
