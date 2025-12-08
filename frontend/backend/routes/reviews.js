import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

// Hent reviews for ett spill
router.get("/game/:gameId", async (req, res) => {
  try {
    const reviews = await Review.find({ gameId: req.params.gameId });
    res.json(reviews);
  } catch (err) {
    console.error("Feil ved henting av reviews:", err);
    res.status(500).json({ message: err.message });
  }
});

// Post nytt review (review, news eller gotw)
router.post("/", async (req, res) => {
  try {
    if (req.body.editorsPick === true) {
      // Fjern Editors Pick fra alle andre
      await Review.updateMany({ editorsPick: true }, { editorsPick: false });
    }

    const review = new Review(req.body);

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (err) {
    console.error("Feil ved lagring av review:", err);
    res.status(400).json({ message: err.message });
  }
});

// Hent siste 6 (nyheter + anmeldelser + gotw)
router.get("/latest", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 }).limit(6);

    res.json(reviews);
  } catch (err) {
    console.error("Feil ved henting av siste reviews:", err);
    res.status(500).json({ message: "Kunne ikke hente siste reviews" });
  }
});

// Hent GOTW — bare den nyeste posten med type="gotw"
router.get("/gotw", async (req, res) => {
  try {
    const gotw = await Review.findOne({ type: "gotw" }).sort({ date: -1 });

    if (!gotw) {
      return res.status(404).json({ message: "Ingen GOTW funnet" });
    }

    res.json(gotw);
  } catch (err) {
    console.error("Feil ved henting av GOTW:", err);
    res.status(500).json({ message: "Kunne ikke hente GOTW" });
  }
});

router.get("/editors-pick", async (req, res) => {
  try {
    const editorsPick = await Review.findOne({ editorsPick: true }).sort({
      date: -1,
    });

    if (!editorsPick) {
      return res.status(404).json({ message: "Ingen Editors Pick satt" });
    }

    res.json(editorsPick);
  } catch (err) {
    console.error("Editors Pick feil:", err);
    res.status(500).json({ message: "Kunne ikke hente Editors Pick" });
  }
});

// Pagination route
router.get("/", async (req, res) => {
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
    console.error("Feil ved henting av reviews", err);
    res.status(500).json({ message: "Kunne ikke hente reviews" });
  }
});

export default router;
