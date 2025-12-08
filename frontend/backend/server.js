// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import uploadRoutes from "./routes/upload.js";
import reviewRoutes from "./routes/reviews.js"; // ✅ bruker routeren din

dotenv.config();

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

// CORS + middleware
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

// ✅ Her monterer du ALLE review-rutene fra routes/reviews.js
app.use("/api/reviews", reviewRoutes);

/* ============================================================
   🔹 Enkel admin-login med JWT
============================================================ */
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Ugyldig innlogging" });
});

// ❌ verifyAdmin trengs ikke lenger her i server.js,
//    siden /api/reviews-rutene nå ligger i routes/reviews.js.
//    (Hvis vi vil beskytte POST/PUT/DELETE der, legger vi middleware i routeren i stedet.)

// Koble til MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB koblet");
    app.listen(PORT, () => console.log(`🚀 Server kjører på port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB feil:", err));
