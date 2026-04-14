require("dotenv").config();
require("./queue/workers/leadWorker");
const voiceRealtimeRoutes = require("./routes/voiceRealtimeRoutes"); 
const voiceRoutes = require("./routes/voiceRealtimeRoutes");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Route Imports
const leadRoutes = require("./routes/LeadRoutes");
const vobizCallRoutes = require("./routes/vobizCallRoutes");
//const voiceRoutes = require("./routes/voiceRealtimeRoutes");

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

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.originalUrl}`, req.body);
  next();
});

/* ---------------------------
    HEALTH CHECKS
---------------------------- */
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "🚀 EXOWA backend is live"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

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

// Realtime & Voice Routes
app.use("/api/voice-realtime", voiceRealtimeRoutes); // Path changed to avoid conflict
app.use("/api/voice", voiceRoutes); // Merged new voice routes here

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
// Default Render PORT 10000 ensures it stays running on cloud
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
