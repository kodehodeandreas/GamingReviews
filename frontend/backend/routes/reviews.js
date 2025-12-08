import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

/* ============================================
   ✅ HENT EN REVIEW VIA ID (REDIGERING)
============================================ */
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review ikke funnet" });
    }

    res.json(review);
  } catch (err) {
    console.error("Feil ved fetch av review:", err);
    res.status(500).json({ message: "Serverfeil ved henting av review" });
  }
});

/* ============================================
   ✅ EDITOR'S PICK
============================================ */
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

/* ============================================
   ✅ GOTW
============================================ */
router.get("/gotw", async (req, res) => {
  try {
    const gotw = await Review.findOne({ type: "gotw" }).sort({ date: -1 });

    if (!gotw) {
      return res.status(404).json({ message: "Ingen GOTW funnet" });
    }

    res.json(gotw);
  } catch (err) {
    console.error("Feil ved GOTW:", err);
    res.status(500).json({ message: "Kunne ikke hente GOTW" });
  }
});

/* ============================================
   ✅ SISTE 6
============================================ */
router.get("/latest", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 }).limit(6);
    res.json(reviews);
  } catch (err) {
    console.error("Latest feil:", err);
    res.status(500).json({ message: "Kunne ikke hente siste reviews" });
  }
});

/* ============================================
   ✅ HENT FOR SPILL
============================================ */
router.get("/game/:gameId", async (req, res) => {
  try {
    const reviews = await Review.find({ gameId: req.params.gameId });
    res.json(reviews);
  } catch (err) {
    console.error("Spillfeil:", err);
    res.status(500).json({ message: "Kunne ikke hente spillreviews" });
  }
});

/* ============================================
   ✅ PAGINATION / LISTE
============================================ */
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
    console.error("Liste-feil:", err);
    res.status(500).json({ message: "Kunne ikke hente reviews" });
  }
});

/* ============================================
   ✅ NY REVIEW
============================================ */
router.post("/", async (req, res) => {
  try {
    if (req.body.editorsPick === true) {
      await Review.updateMany({ editorsPick: true }, { editorsPick: false });
    }

    const review = new Review(req.body);
    const saved = await review.save();

    res.json(saved);
  } catch (err) {
    console.error("POST-feil:", err);
    res.status(500).json({ message: "Kunne ikke lagre review" });
  }
});

/* ============================================
   ✅ OPPDATER REVIEW
============================================ */
router.put("/:id", async (req, res) => {
  try {
    if (req.body.editorsPick === true) {
      await Review.updateMany({ editorsPick: true }, { editorsPick: false });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Ikke funnet" });
    }

    res.json(updated);
  } catch (err) {
    console.error("PUT-feil:", err);
    res.status(500).json({ message: "Kunne ikke oppdatere review" });
  }
});

/* ============================================
   ✅ SLETT
============================================ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Fant ikke innlegget" });
    }

    res.json({ message: "Slettet" });
  } catch (err) {
    console.error("DELETE-feil:", err);
    res.status(500).json({ message: "Kunne ikke slette" });
  }
});

export default router;
