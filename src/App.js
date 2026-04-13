require("dotenv").config();
require("./queue/workers/leadWorker");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Route Imports
const leadRoutes = require("./routes/LeadRoutes");
const vobizCallRoutes = require("./routes/vobizCallRoutes");

const setupBullBoard = require("./queue/bullBoard");
const startHealthScheduler = require("./monitoring/healthScheduler");

// Initialize App
const app = express();

/* ---------------------------
   MIDDLEWARES
---------------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// IMPORTANT: Body parsers before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.originalUrl}`, req.body);
  next();
});

/* ---------------------------
   HEALTH CHECK
---------------------------- */
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "🚀 EXOWA backend is live"
  });
});

// Route debug check
app.get("/test", (req, res) => {
  return res.status(200).send("Route working");
});

/* ---------------------------
   API ROUTES
---------------------------- */

// Lead Routes
app.use("/api/leads", leadRoutes);

// Vobiz Call Routes
app.use("/api/vobiz", vobizCallRoutes);

/* ---------------------------
   404 HANDLER
---------------------------- */
app.use((req, res) => {
  console.log("❌ Route not found:", req.method, req.originalUrl);

  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* ---------------------------
   ERROR HANDLER
---------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

/* ---------------------------
   BULL BOARD
---------------------------- */
setupBullBoard(app);

/* ---------------------------
   MONGODB CONNECTION
---------------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

/* ---------------------------
   SCHEDULER
---------------------------- */
startHealthScheduler();

/* ---------------------------
   SERVER START
---------------------------- */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
