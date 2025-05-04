const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');



dotenv.config();
const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors());
app.use(express.json());
const hazardRoutes = require('./routes/hazards');

app.use('/api/hazards', hazardRoutes);

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

