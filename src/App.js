require("dotenv").config();
require("./queue/workers/leadWorker");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const leadRoutes = require("./routes/LeadRoutes");
const setupBullBoard = require("./queue/bullBoard");
const startHealthScheduler = require("./monitoring/healthScheduler");

const app = express();

/* ---------------------------
   MIDDLEWARES
---------------------------- */
app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

/* ---------------------------
   REQUEST LOGGER
---------------------------- */
app.use((req, res, next) => {
  console.log(
    `📩 ${req.method} ${req.url}`,
    req.body
  );
  next();
});

/* ---------------------------
   HEALTH CHECK
---------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🚀 EXOWA backend is live"
  });
});

/* ---------------------------
   API ROUTES
---------------------------- */
app.use(
  "/api/leads",
  leadRoutes
);

/* ---------------------------
   BULL BOARD
---------------------------- */
setupBullBoard(app);

/* ---------------------------
   MONGODB CONNECTION
---------------------------- */
mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => {
    console.log(
      "✅ MongoDB connected successfully"
    );
  })
  .catch((error) => {
    console.error(
      "❌ MongoDB connection error:",
      error
    );
  });

const vobizCallRoutes =
  require("./routes/vobizCallRoutes");

app.use(
  "/api/vobiz",
  vobizCallRoutes
);

/* ---------------------------
   SCHEDULER
---------------------------- */
startHealthScheduler();

/* ---------------------------
   SERVER START
---------------------------- */
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});
