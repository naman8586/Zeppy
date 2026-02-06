require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const otpRoutes = require("./routes/otp");
const mediaRoutes = require("./routes/media");

const app = express();

/* ======================================================
   DATABASE
====================================================== */
connectDB();

/* ======================================================
   CORS (FINAL, NO CUSTOM LOGIC, NO ERRORS)
====================================================== */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Explicit preflight response (Node 22 safe)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

/* ======================================================
   BODY PARSERS
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   REQUEST LOGGER
====================================================== */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ======================================================
   STATIC FILES
====================================================== */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/media", mediaRoutes);

/* ======================================================
   SYSTEM ROUTES
====================================================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎯 Welcome to Zappy API",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/* ======================================================
   404 HANDLER
====================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ======================================================
   SERVER START
====================================================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║         ZAPPY TERMINAL ACTIVE          ║
╠════════════════════════════════════════╣
║ 📍 API: http://localhost:${PORT}        ║
║ 🌐 FE:  http://localhost:3000           ║
║ 🔓 CORS: FIXED                          ║
╚════════════════════════════════════════╝
`);
});

/* ======================================================
   PROCESS SAFETY
====================================================== */
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});
