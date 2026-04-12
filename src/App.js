require("dotenv").config();
require("./queue/workers/leadWorker");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Route Imports
const leadRoutes = require("./routes/LeadRoutes");
const vobizWebhookRoutes = require("./routes/vobizWebhookRoutes");
const vobizCallRoutes = require("./routes/vobizCallRoutes");
const setupBullBoard = require("./queue/bullBoard");
const startHealthScheduler = require("./monitoring/healthScheduler");

// 1. INITIALIZE APP FIRST 🚀
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

// Body Parsers (Must be above routes!)
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
  res.status(200).json({
    success: true,
    message: "🚀 EXOWA backend is live"
  });
});

/* ---------------------------
    API ROUTES
---------------------------- */
// Lead Routes
app.use("/api/leads", leadRoutes);

// Vobiz Routes (Webhook and Calls)
app.use("/api/vobiz", vobizWebhookRoutes);
app.use("/api/vobiz", vobizCallRoutes);

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
const PORT = process.env.PORT || 10000; // Updated to 10000 to match Render's default

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
