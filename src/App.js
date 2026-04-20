require("dotenv").config();
require("./queue/workers/leadWorker");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

/* ROUTES */
const leadRoutes = require("./routes/LeadRoutes");
const vobizCallRoutes = require("./routes/voiceRealtimeRoutes");
const voiceRealtimeRoutes = require("./routes/voiceRealtimeRoutes");

/* SERVICES */
const setupBullBoard = require("./queue/bullBoard");
const startHealthScheduler = require("./monitoring/healthScheduler");

/* INIT APP */
const app = express();

/* ---------------------------
   MIDDLEWARES
---------------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

/* ---------------------------
   REQUEST LOGGER
---------------------------- */
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.originalUrl}`, req.body);
  next();
});

/* ---------------------------
   HEALTH ROUTES
---------------------------- */
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "🚀 EXOWA backend is live",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.get("/test", (req, res) => {
  return res.status(200).send("Route working");
});

/* ---------------------------
   VOICE DIRECT TEST ROUTE
   (IMPORTANT FOR DEBUGGING)
---------------------------- */
app.get("/api/voice/answer", (req, res) => {
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    "<Response>" +
    '<Speak language="hi-IN" voice="WOMAN">' +
    "नमस्ते, मैं Exowa AI sales assistant बोल रही हूँ।" +
    "</Speak>" +
    "</Response>";

  res.set("Content-Type", "application/xml");
  return res.status(200).send(xml);
});

app.post("/api/voice/answer", (req, res) => {
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    "<Response>" +
    '<Speak language="hi-IN" voice="WOMAN">' +
    "नमस्ते, मैं Exowa AI sales assistant बोल रही हूँ।" +
    "</Speak>" +
    "</Response>";

  res.set("Content-Type", "application/xml");
  return res.status(200).send(xml);
});

/* ---------------------------
   API ROUTES
---------------------------- */

/* LEAD ROUTES */
app.use("/api/leads", leadRoutes);

/* VOBIZ ROUTES */
app.use("/api/vobiz", vobizCallRoutes);

/* REALTIME VOICE ROUTES */
app.use("/api/voice", voiceRealtimeRoutes);

/* ---------------------------
   BULL BOARD
---------------------------- */
setupBullBoard(app);

/* ---------------------------
   404 HANDLER
---------------------------- */
app.use((req, res) => {
  console.log("❌ Route not found:", req.method, req.originalUrl);

  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ---------------------------
   ERROR HANDLER
---------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

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
