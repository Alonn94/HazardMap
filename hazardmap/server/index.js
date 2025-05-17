const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5051;
// ✅ CORS middleware first
app.use(cors({
    origin: ['http://localhost:5173', 'https://hazard-map-client.onrender.com'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  app.options('*', cors());

// ✅ JSON parsing
app.use(express.json());

// ✅ Mount routes after middleware
const hazardRoutes = require('./routes/hazards');
const authRoutes = require('./routes/auth');
const commentsRoutes = require('./routes/comments');
const savedRoutes = require('./routes/savedRoutes');


app.use('/api/hazards', hazardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/routes', savedRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Hazard Map API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});