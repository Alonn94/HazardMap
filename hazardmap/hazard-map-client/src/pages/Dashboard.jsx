import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HazardMap from '../components/HazardMap';
import Modal from '../components/Modal';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import * as turf from '@turf/turf';
import './Dashboard.css';


const reverseGeocode = async ([lon, lat]) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await res.json();
    return data.display_name || `${lat}, ${lon}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${lat}, ${lon}`;
  }
};


const Dashboard = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [hazards, setHazards] = useState([]);
  const [form, setForm] = useState({ title: '', latitude: '', longitude: '', description: '', type: '', severity: '' });
  const [newLocation, setNewLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [routeHazards, setRouteHazards] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeLine, setRouteLine] = useState([]);
  const [travelMode, setTravelMode] = useState('cycling-regular');
  const [selectionMode, setSelectionMode] = useState(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [showSavedRoutes, setShowSavedRoutes] = useState(false);

  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded?.id;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const endpoint = editingId ? `${BASE_URL}/api/hazards/${editingId}` : `${BASE_URL}/api/hazards`;
      const formData = new FormData();
      Object.entries(form).forEach(([key,value])=>{
        formData.append(key, value);
      });
      const res = await fetch(endpoint, {
        method,
        headers: {Authorization: `Bearer ${token}` },
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        if (editingId) {
          setHazards(hazards.map((h) => (h.id === editingId ? data : h)));
        } else {
          setHazards([data, ...hazards]);
        }
        setForm({ title: '', latitude: '', longitude: '', description: '', type: '', severity: '' });
        setEditingId(null);
        setIsModalOpen(false);
      } else {
        alert(data.error || 'Failed to submit hazard.');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/api/hazards/${id}`, {
            method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setHazards(hazards.filter((h) => h.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete hazard.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (hazard) => {
    setForm({
      title: hazard.title,
      latitude: hazard.latitude,
      longitude: hazard.longitude,
      description: hazard.description,
      type: hazard.type,
      severity: hazard.severity,
    });
    setEditingId(hazard.id);
    setNewLocation({ latitude: hazard.latitude, longitude: hazard.longitude });
    setIsModalOpen(true);
  };

  const handleVote = async (id, voteType) => {
    try {
        const res = await fetch(`${BASE_URL}/api/hazards/${id}/vote`, {
            method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ voteType }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        if (data.message?.includes("Hazard has been resolved by 5 votes and was removed")) {
            alert("This hazard received 5 votes and was removed");
            setHazards((prev) => prev.filter((h) => h.id !== id));
            return;
        }

        const resComments = await fetch(`${BASE_URL}/api/comments/hazard/${id}`);
        const comments = resComments.ok ? await resComments.json() : [];
        setHazards(hazards.map((h) => (h.id === id ? { ...data, comments, showAllComments: h.showAllComments || false } : h)));
      } else {
        alert(data.error || 'Failed to vote.');
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleSaveRoute = async () => {
    try {
        const res = await fetch(`${BASE_URL}/api/routes`, {
            method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_address: startAddress,
          end_address: endAddress,
          start_coords: JSON.stringify(startPoint),
          end_coords: JSON.stringify(endPoint),
        }),
      });
      const newRoute = await res.json();
      if (res.ok) {
        setSavedRoutes([newRoute, ...savedRoutes]);
        alert('Route saved!');
      } else {
        alert(newRoute.error || 'Failed to save route');
      }
    } catch (err) {
      console.error('Save route error:', err);
    }
  };


const parseCoords = (value) => {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (err) {
    console.error("Failed to parse coordinates:", value);
    return null;
  }
};

const handleSelectRoute = async (e) => {
  const route = savedRoutes.find((r) => r.id === Number(e.target.value));
  if (route) {
    setStartAddress(route.start_address);
    setEndAddress(route.end_address);

    const start = parseCoords(route.start_coords);
    const end = parseCoords(route.end_coords);

    if (!start || !end) return;

    setStartPoint(start);
    setEndPoint(end);
  }
};
  const computeHazardsAlongRoute = async () => {
    if (!startPoint || !endPoint) return;
    try {
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/${travelMode}/geojson`,
        { coordinates: [startPoint, endPoint] },
        { headers: { Authorization: import.meta.env.VITE_ORS_API_KEY, 'Content-Type': 'application/json' } }
      );
      const geometry = response.data.features[0].geometry;
      const coords = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      setRouteLine(coords);

      const turfLine = turf.lineString(geometry.coordinates);
      const buffered = turf.buffer(turfLine, 0.1, { units: 'kilometers' });

      const filtered = hazards.filter((hazard) => {
        const point = turf.point([parseFloat(hazard.longitude), parseFloat(hazard.latitude)]);
        return turf.booleanPointInPolygon(point, buffered);
      });
      setRouteHazards(filtered);
    } catch (error) {
      console.error('Error fetching route:', error.response?.data || error.message);
    }
  };

  const handleCommentSubmit = async (e, hazardId) => {
    e.preventDefault();
    const text = e.target.elements[`comment-${hazardId}`].value;
    try {
        const res = await fetch(`${BASE_URL}/api/comments`, {
            method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hazard_id: hazardId, content: text }),
      });
      const newComment = await res.json();
      if (res.ok) {
        setHazards((prev) =>
          prev.map((h) => (h.id === hazardId ? { ...h, comments: [...(h.comments || []), newComment] } : h))
        );
        e.target.reset();
      } else {
        alert(newComment.error || 'Failed to add comment.');
      }
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleGeocode = async (type) => {
    const address = type === 'start' ? startAddress : endAddress;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const coords = [parseFloat(lon), parseFloat(lat)];
        type === 'start' ? setStartPoint(coords) : setEndPoint(coords);
      } else {
        alert(`No results found for ${type} address`);
      }
    } catch (error) {
      alert('Failed to get location from address');
    }
  };

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/hazards`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const hazardsData = await res.json();
        const hazardsWithComments = await Promise.all(
          hazardsData.map(async (hazard) => {
            const res = await fetch(`${BASE_URL}/api/comments/hazard/${hazard.id}`);
            const comments = res.ok ? await res.json() : [];
            return { ...hazard, comments, showAllComments: false, showImage:false };
          })
        );
        setHazards(hazardsWithComments);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    if (token) fetchHazards();
  }, [token]);
  useEffect(() => {
    if (newLocation?.latitude !== undefined && newLocation?.longitude !== undefined) {
      setForm((prev) => ({ ...prev, latitude: newLocation.latitude.toFixed(5), longitude: newLocation.longitude.toFixed(5) }));
    }
  }, [newLocation]);

  useEffect(() => {
    const fetchSavedRoutes = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/routes`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSavedRoutes(data);
        }
      } catch (err) {
        console.error('Error fetching saved routes:', err);
      }
    };
    if (token) fetchSavedRoutes();
  }, [token]);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (startAddress.trim()) {
        handleGeocode('start');
      }
    }, 600); // 600ms delay
  
    return () => clearTimeout(delayDebounce);
  }, [startAddress]);
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (endAddress.trim()) {
        handleGeocode('end');
      }
    }, 600);
  
    return () => clearTimeout(delayDebounce);
  }, [endAddress]);

  useEffect(() => {
    if (startPoint && endPoint) {
      computeHazardsAlongRoute();
    }
  }, [startPoint, endPoint]);


  const sourceList = routeHazards.length > 0 ? routeHazards : hazards;

  const filteredHazards = sourceList.filter((h) => {
    const matchType = filterType ? h.type === filterType : true;
    const matchSeverity = filterSeverity ? h.severity === filterSeverity : true;
    const matchOwner = showOnlyMine ? h.user_id === userId : true;
    return matchType && matchSeverity && matchOwner;
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-left">
        <div className="dashboard-header">
          <h2>Hazard Dashboard</h2>
          <button onClick={handleLogout}>Log Out</button>
        </div>

        <div className="itinerary-section">
          <h4>Plan Itinerary</h4>
          <button onClick={() => setSelectionMode('start')}>Select Start Point</button>
          <button onClick={() => setSelectionMode('end')}>Select End Point</button>
          <input placeholder="Start Address" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} />
          <input placeholder="End Address" value={endAddress} onChange={(e) => setEndAddress(e.target.value)} />
          <select value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
            <option value="cycling-regular">Bike</option>
            <option value="foot-walking">Walk</option>
          </select>
          {startPoint && endPoint && (
            <button onClick={handleSaveRoute}>Save this route</button>
          )}
{savedRoutes.length > 0 && (
  <>
    <button onClick={() => setShowSavedRoutes((prev) => !prev)}>
      {showSavedRoutes ? 'Hide Saved Routes' : 'Show Saved Routes'}
    </button>
    
    {showSavedRoutes && (
      <ul className="saved-routes-list">
        {savedRoutes.map((route) => (
          <li key={route.id}>
            <span
              onClick={() =>
                handleSelectRoute({ target: { value: route.id } })
              }
            >
              {route.start_address} → {route.end_address}
            </span>
            <button
  className="route-delete-btn"
  onClick={async () => {
    const confirmDelete = window.confirm('Delete this route?');
    if (!confirmDelete) return;
    try {
        const res = await fetch(`${BASE_URL}/api/routes/${route.id}`, {
                    method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSavedRoutes((prev) => prev.filter((r) => r.id !== route.id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete route');
      }
    } catch (err) {
      console.error('Delete route error:', err);
    }
  }}
>
  🗑
</button>
          </li>
        ))}
      </ul>
    )}
  </>
)}
    
          <button onClick={computeHazardsAlongRoute}>Find Hazards</button>
          {routeHazards.length > 0 && (
  <button onClick={() => setRouteHazards([])}>
    Show All Hazards
  </button>
)}
          <label>
            Filter by Type:
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All</option>
              {[...new Set(hazards.map((h) => h.type).filter(Boolean))].map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Filter by Severity:
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="">All</option>
              {[...new Set(hazards.map((h) => h.severity).filter(Boolean))].map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <button onClick={() => setShowOnlyMine(!showOnlyMine)}>
            {showOnlyMine ? 'Show All Hazards' : 'Show My Hazards Only'}
          </button>
        </div>

        <ul className="hazard-list">
          {filteredHazards.map((hazard) => (
            <li className="hazard-item" key={hazard.id}>
  <strong>{hazard.title}</strong>
  <p>{hazard.description}</p>
  <p>Type: {hazard.type} || Severity: {hazard.severity}</p>
  {/* <p>📍 {hazard.latitude}, {hazard.longitude}</p> */}
  <p>🚧⛔{hazard.relevant_votes} | ✅  {hazard.not_relevant_votes}</p>
  <button onClick={() => handleVote(hazard.id, 'relevant')} className={hazard.user_vote === "relevant" ? "active-vote":""}>STILL PRESENT</button>
  <button onClick={() => handleVote(hazard.id, 'not_relevant')}className={hazard.user_vote === "not_relevant" ? "active-vote":""}>RESOLVED</button>

  <div className="comment-block">
  {(hazard.comments || []).slice(hazard.showAllComments ? 0 : -3).map((c, i) => (
  <div className="comment-item" key={c.id}>
    <span className="comment-icon">💬</span>
    <span className="comment-text">{c.content}</span>
    {c.user_id === userId && (
      <button
        className="delete-comment-button"
        onClick={async () => {
          const confirmDelete = window.confirm('Delete this comment?');
          if (!confirmDelete) return;

          try {
            const res = await fetch(`${BASE_URL}/api/comments/${c.id}`, {              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              setHazards((prev) =>
                prev.map((h) =>
                  h.id === hazard.id
                    ? { ...h, comments: h.comments.filter((com) => com.id !== c.id) }
                    : h
                )
              );
            } else {
              const data = await res.json();
              alert(data.error || 'Failed to delete comment');
            }
          } catch (err) {
            console.error('Error deleting comment:', err);
          }
        }}
      >
        🗑
      </button>
    )}
  </div>
))}
</div>
{(hazard.comments ?? []).length > 3 && (
  <button onClick={() =>
    setHazards((prev) =>
      prev.map((h) =>
        h.id === hazard.id ? { ...h, showAllComments: !h.showAllComments } : h
      )
    )
  }>
    {hazard.showAllComments ? 'Show Less' : 'Show More'}
  </button>
)}

{hazard.image && (
  <button onClick={() =>
    setHazards((prev) =>
      prev.map((h) =>
        h.id === hazard.id ? { ...h, showImage: !h.showImage } : h
      )
    )
  }>
    {hazard.showImage ? 'Hide Image' : 'Show Image'}
  </button>
)}

{hazard.showImage && hazard.image && (
  <img
  src={`${BASE_URL}/uploads/${hazard.image}`}
    alt="Hazard"
    style={{
      width: '100%',
      maxWidth: '300px',
      margin: '0.5rem 0',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}
  />
)}
              <form onSubmit={(e) => handleCommentSubmit(e, hazard.id)}>
                <input name={`comment-${hazard.id}`} placeholder="Add a comment" required />
                <button type="submit">Comment</button>
              </form>
              {hazard.user_id === userId && (
                <>
                  <button onClick={() => handleDelete(hazard.id)}>🗑</button>
                  <button onClick={() => handleEdit(hazard)}>✏️</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="dashboard-map">
        <HazardMap
          hazards={filteredHazards}
          routeHazards={routeHazards}
          routeLine={routeLine}
          startPoint={startPoint}
          endPoint={endPoint}
          onMapClick={async (coords) => {
            if (selectionMode === 'start') {
              const address = await reverseGeocode([coords.longitude, coords.latitude]);
              setStartPoint([coords.longitude, coords.latitude]);
              setStartAddress(address);
            } else if (selectionMode === 'end') {
              const address = await reverseGeocode([coords.longitude, coords.latitude]);
              setEndPoint([coords.longitude, coords.latitude]);
              setEndAddress(address);
            } else {
              setNewLocation(coords);
              setIsModalOpen(true);
            }
            setSelectionMode(null);
          }}
        />
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h3>{editingId ? 'Edit Hazard' : 'Report a New Hazard'}</h3>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
    name="title"
    placeholder="Title"
    value={form.title}
    onChange={handleChange}
    required
  />
  
  <input
    name="description"
    placeholder="Description"
    value={form.description}
    onChange={handleChange}
  />

  <label>
    Type:
    <select name="type" value={form.type} onChange={handleChange} required>
      <option value="">Select Type</option>
      <option value="pothole">Pothole</option>
      <option value="construction">Construction</option>
      <option value="flood">Flood</option>
      <option value="fallen tree">Fallen Tree</option>
      <option value="missing signage">Missing Signage</option>
      <option value="broken light">Broken Streetlight</option>
      <option value="slippery surface">Slippery Surface</option>
      <option value="other">Other</option>
    </select>
  </label>

  <label>
    Severity:
    <select name="severity" value={form.severity} onChange={handleChange} required>
      <option value="">Select Severity</option>
      <option value="low">Low</option>
      <option value="moderate">Moderate</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </select>
  </label>

  <input
    type="file"
    name="image"
    accept="image/*"
    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
  />

  <button type="submit">
    {editingId ? 'Update Hazard' : 'Submit Hazard'}
  </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;