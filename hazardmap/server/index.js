const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5051;

// ✅ Very strict but proven working CORS config
const corsOptions = {
  origin: ['http://localhost:5173', 'https://hazard-map-client.onrender.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// ✅ Place these before anything else
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // handles preflight properly

app.use(express.json());

// ✅ Mount routes
app.use('/api/hazards', require('./routes/hazards'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/routes', require('./routes/savedRoutes'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Welcome to the Hazard Map API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});