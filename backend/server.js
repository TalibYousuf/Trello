const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const boardRoutes = require('./routes/boardRoutes');

dotenv.config();
const app = express();

// // CORS middleware — put this **before routes**
// app.use(cors({
//   origin: 'http://localhost:3000', // frontend origin
//   methods: ['GET','POST','PUT','DELETE'],
//   credentials: true
// }));
app.use(cors()); // allow all origins, 
app.use(express.json());

// Routes
app.use('/api/board', boardRoutes);

// Error handling 
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log('MongoDB connection error:', err));