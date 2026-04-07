require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const leadRoutes = require("./routes/leadRoutes");
const setupBullBoard = require("./queue/bullBoard");

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
