import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HazardMap from '../components/HazardMap';
import Modal from '../components/Modal';


const Dashboard = () => {
  const [hazards, setHazards] = useState([]);
  const [form, setForm] = useState({
    title: "",
    latitude: "",
    longitude: "",
    description: "",
    type: "",
    severity: ""
  });
  const [newLocation, setNewLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/hazards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setHazards([data, ...hazards]); // Add new hazard to list
        setForm({ title: "", latitude: "", longitude: "", description: "", type: "", severity: "" });
      } else {
        alert(data.error || "Failed to submit hazard.");
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  useEffect(() => {
    const fetchHazards = async () => {

      try {
        const res = await fetch("/api/hazards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setHazards(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (token) fetchHazards();
  }, [token]);


  useEffect(() => {
    if (newLocation) {
      console.log("Clicked location:", newLocation); // 👈 Add it here
  
      if (newLocation.latitude !== undefined && newLocation.longitude !== undefined) {
        setForm((prevForm) => ({
          ...prevForm,
          latitude: newLocation.latitude.toFixed(5),
          longitude: newLocation.longitude.toFixed(5),
        }));
      }
    }
  }, [newLocation]);

  return (
    <div>
      <h2>Hazard Dashboard</h2>
      <button onClick={handleLogout}>Log Out</button>


      {isModalOpen && (
  <Modal onClose={() => setIsModalOpen(false)}>
    <h3>Report a New Hazard</h3>
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} required />
      <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} required />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input name="type" placeholder="Type (e.g. pothole)" value={form.type} onChange={handleChange} />
      <input name="severity" placeholder="Severity (e.g. high)" value={form.severity} onChange={handleChange} />
      <button type="submit">Submit Hazard</button>
    </form>
  </Modal>
)}

      <hr />
      {hazards.length > 0 && (
  <HazardMap
    hazards={hazards}
    onMapClick={(coords) => {
        console.log("Map clicked, coords:", coords);
      setNewLocation(coords);
      setIsModalOpen(true); // show the modal
    }}
  />
)}              <ul>
        {hazards.map((hazard) => (
          <li key={hazard.id}>
            <strong>{hazard.title}</strong><br />
            {hazard.description}<br />
            {hazard.type}, {hazard.severity}<br />
            📍 {hazard.latitude}, {hazard.longitude}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;