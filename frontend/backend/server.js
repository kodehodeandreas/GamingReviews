import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import uploadRoutes from "./routes/upload.js";

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

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);

// Koble til MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB koblet");
    app.listen(PORT, () => console.log(`🚀 Server kjører på port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB feil:", err));

/* ============================================================
   SCHEMA
============================================================ */
const reviewSchema = new mongoose.Schema({
  gameId: { type: String, required: false },
  title: { type: String, required: true },
  summary: { type: String, trim: true, maxlength: 350, default: "" },
  content: { type: String, required: true },
  imageUrl: { type: String, required: true },
  secondaryImageUrl: { type: String, default: "" },
  galleryImages: { type: [String], default: [] },
  pros: { type: [String], default: [] },
  cons: { type: [String], default: [] },
  rating: { type: Number, default: null },
  type: { type: String, enum: ["review", "news", "gotw"], default: "review" },
  platforms: { type: [String], default: [] },
  date: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

/* ============================================================
   🔹 NY KODE — Enkel admin-login med JWT
============================================================ */
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    // Oppretter en token som varer i 2 timer
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Ugyldig innlogging" });
});

//  Middleware for å beskytte sensitive ruter
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(403).json({ message: "Ingen token funnet" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Ugyldig token" });
    req.user = user;
    next();
  });
}

/* ============================================================
   ROUTES
============================================================ */

app.get("/api/reviews", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Feil ved henting av reviews" });
  }
});

// Hent de 6 nyeste anmeldelsene
app.get("/api/reviews/latest", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 }).limit(6);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Feil ved henting av siste reviews" });
  }
});

app.get("/api/reviews/gotw", async (req, res) => {
  try {
    const gotw = await Review.findOne({ type: "gotw" }).sort({ date: -1 });

    if (!gotw) {
      return res.status(404).json({ message: "Ingen GOTW funnet" });
    }

    res.json(gotw);
  } catch (err) {
    console.error("Feil ved henting av GOTW:", err);
    res.status(500).json({ message: "Feil ved henting av GOTW" });
  }
});

app.post("/api/reviews", verifyAdmin, async (req, res) => {
  try {
    const {
      gameId,
      title,
      summary,
      content,
      imageUrl,
      secondaryImageUrl,
      galleryImages,
      pros,
      cons,
      rating,
      type,
      platforms,
    } = req.body;

    // Sjekk minimumsverdier
    if (!title || !content || !imageUrl) {
      return res
        .status(400)
        .json({ message: "Tittel, innhold og hovedbilde er påkrevd." });
    }

    // Opprett nytt dokument
    const review = new Review({
      gameId: gameId || "",
      title,
      summary: summary || "",
      content,
      imageUrl,
      secondaryImageUrl: secondaryImageUrl || "",
      galleryImages: Array.isArray(galleryImages)
        ? galleryImages
        : galleryImages
        ? [galleryImages]
        : [],
      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      rating: rating ? parseFloat(rating) : null,
      type: type || "review",
      platforms: Array.isArray(platforms) ? platforms : [],
      date: new Date(),
    });

    const saved = await review.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Feil ved lagring av review" });
  }
});

app.get("/api/reviews/game/:gameId", async (req, res) => {
  try {
    const reviews = await Review.find({ gameId: req.params.gameId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Feil ved henting av spillreviews" });
  }
});

app.get("/api/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review ikke funnet" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Feil ved henting av review" });
  }
});

app.delete("/api/reviews/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ikke funnet" });
    res.json({ message: "Slettet" });
  } catch (err) {
    res.status(500).json({ message: "Feil ved sletting" });
  }
});

app.put("/api/reviews/:id", verifyAdmin, async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Ikke funnet" });
    res.json(updated);
  } catch (err) {
    console.error("Feil ved oppdatering:", err);
    res.status(500).json({ message: "Feil ved oppdatering" });
  }
});
