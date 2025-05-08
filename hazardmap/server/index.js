const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;
app.use(cors());
app.use(express.json());

const hazardRoutes = require('./routes/hazards');
const authRoutes = require('./routes/auth');

app.use('/api/hazards', hazardRoutes);
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Hazard Map API");
});
app.post('/test', (req, res) => {
    res.status(200).json({ msg: "Test OK" });
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}
);

