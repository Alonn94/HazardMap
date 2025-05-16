import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';


function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login"); 
  }, []);

  return null; 
}

export default App;