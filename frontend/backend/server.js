import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import uploadRoutes from "./routes/upload.js";
import reviewRoutes from "./routes/reviews.js";

dotenv.config();

/* ============================================================
   ENV CHECK
============================================================ */
if (
  !process.env.JWT_SECRET ||
  !process.env.ADMIN_PASSWORD ||
  !process.env.MONGO_URI
) {
  throw new Error("❌ Miljøvariabler mangler. Sjekk .env-filen.");
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/* ============================================================
   MIDDLEWARE
============================================================ */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://kodehodeandreas.github.io"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);

/* ============================================================
   REVIEW ROUTES
============================================================ */
app.use("/api/reviews", reviewRoutes);

/* ============================================================
   ADMIN LOGIN
============================================================ */
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Ugyldig innlogging" });
});

/* ============================================================
   ❗ DEBUG ROUTE: TEST DATABASE
============================================================ */
app.get("/api/debug/db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    res.json({
      connected: mongoose.connection.readyState === 1,
      collections: collections.map((c) => c.name),
    });
  } catch (err) {
    console.error("DB DEBUG FEIL:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GLOBAL ERROR LOGGER
============================================================ */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL SERVER ERROR:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

/* ============================================================
   CONNECT DB
============================================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB koblet");
    app.listen(PORT, () => console.log(`🚀 Server kjører på port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB feil:", err));
