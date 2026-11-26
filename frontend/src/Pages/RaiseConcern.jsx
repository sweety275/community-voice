import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RaiseConcern.css";

function RaiseConcern() {
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState("");
  const [showTrackingPopup, setShowTrackingPopup] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    campus: "",
    house: "",
    description: "",
    priority: "Medium",
    reportingMode: "Named"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTrackingCode("");
    setShowTrackingPopup(false);
    setCopyStatus("");

    try {
      const response = await fetch("http://localhost:5000/api/concerns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit concern.");
      }

      if (data.trackingCode) {
        setTrackingCode(data.trackingCode);
        setShowTrackingPopup(true);
      } else {
        alert("Your concern has been submitted successfully!");
      }

      setFormData({
        title: "",
        category: "",
        campus: "",
        house: "",
        description: "",
        priority: "Medium",
        reportingMode: "Named"
      });

    } catch (error) {
      alert(error.message || "Unable to connect to the backend.");
    }
  };

  return (
    <div className="concern-page">
      <div className="concern-card">
        <h2>Raise a Concern</h2>
        <p>Share your concern. Your voice matters.</p>

        {showTrackingPopup && (
          <div className="tracking-popup">
            <div className="tracking-popup-content">
              <h3>Concern Submitted Successfully!</h3>
              <p>Your Anonymous Tracking Code:</p>
              <strong>{trackingCode}</strong>
              <p>Save this code safely. You will need it to track your concern.</p>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(trackingCode);
                    setCopyStatus("Code copied successfully!");
                  } catch {
                    setCopyStatus("Copy failed. Please copy the code manually.");
                  }
                }}
              >
                Copy Code
              </button>

              {copyStatus && <p>{copyStatus}</p>}

              <button
                type="button"
                onClick={() => setShowTrackingPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Concern Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter concern title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select category</option>
            <option>Infrastructure & Facilities</option>
            <option>Food & Kitchen</option>
            <option>Hygiene & Cleanliness</option>
            <option>Internet & Technology</option>
            <option>Community Rules</option>
            <option>Behaviour & Communication</option>
            <option>Safety & Security</option>
            <option>Academic Concerns</option>
            <option>Suggestions & Improvements</option>
            <option>Other</option>
          </select>

          <label>Campus</label>
          <input
            type="text"
            name="campus"
            placeholder="Enter your campus"
            value={formData.campus}
            onChange={handleChange}
            required
          />

          <label>House / Location</label>
          <input
            type="text"
            name="house"
            placeholder="Enter house or location"
            value={formData.house}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Explain your concern..."
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Reporting Mode</label>
          <select
            name="reportingMode"
            value={formData.reportingMode}
            onChange={handleChange}
          >
            <option value="Named">Named</option>
            <option value="Confidential">Confidential</option>
            <option value="Anonymous">Anonymous</option>
          </select>

          <div className="reporting-info">
            {formData.reportingMode === "Named" && (
              <p>Your name will be associated with this concern and visible to authorized handlers.</p>
            )}

            {formData.reportingMode === "Confidential" && (
              <p>Your identity will be protected and shared only with authorized people handling your concern.</p>
            )}

            {formData.reportingMode === "Anonymous" && (
              <p>Your user ID will not be stored in the concern record. However, complete anonymity cannot be guaranteed.</p>
            )}
          </div>

          <button type="submit">Submit Concern</button>
          <button
            type="button"
            className="back-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default RaiseConcern;
