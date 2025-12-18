import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

/* ============================================================
   ✅ SPESIALRUTER FØRST
============================================================ */

// Hent siste 6
router.get("/latest", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 }).limit(6);
    res.json(reviews);
  } catch (err) {
    console.error("FEIL /latest:", err);
    res.status(500).json({ message: "Serverfeil ved henting av review" });
  }
});

// Hent GOTW
router.get("/gotw", async (req, res) => {
  try {
    const gotw = await Review.findOne({ type: "gotw" }).sort({ date: -1 });
    if (!gotw) return res.status(404).json({ message: "Ingen GOTW funnet" });
    res.json(gotw);
  } catch (err) {
    console.error("FEIL /gotw:", err);
    res.status(500).json({ message: "Serverfeil ved GOTW" });
  }
});

// Hent Editors Pick
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
    console.error("FEIL /editors-pick:", err);
    res.status(500).json({ message: "Serverfeil ved Editors Pick" });
  }
});

// Hent reviews for ett spill
router.get("/game/:gameId", async (req, res) => {
  try {
    const reviews = await Review.find({ gameId: req.params.gameId });
    res.json(reviews);
  } catch (err) {
    console.error("FEIL /game:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ✅ POST NY REVIEW
============================================================ */

router.post("/", async (req, res) => {
  try {
    if (req.body.editorsPick === true) {
      await Review.updateMany({ editorsPick: true }, { editorsPick: false });
    }

    const review = new Review(req.body);
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (err) {
    console.error("FEIL POST /:", err);
    res.status(400).json({ message: err.message });
  }
});

/* ============================================================
   ✅ PAGINATION
============================================================ */

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
    console.error("FEIL PAGINATION:", err);
    res.status(500).json({ message: "Kunne ikke hente reviews" });
  }
});

/* ============================================================
   ✅ LEGG TIL KOMMENTAR (MÅ LIGGE FØR /:id)
============================================================ */

router.post("/:id/comments", async (req, res) => {
  try {
    const { author, text, isAdmin } = req.body;

    if (!author || !text) {
      return res.status(400).json({ message: "Forfatter og tekst er påkrevd" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review ikke funnet" });
    }

    review.comments.push({ author, text, isAdmin: isAdmin === true });
    await review.save();

    res.json(review);
  } catch (err) {
    console.error("FEIL POST /:id/comments:", err);
    res.status(500).json({ message: "Kunne ikke legge til kommentar" });
  }
});

/* ============================================================
   ✅ SLETT KOMMENTAR
============================================================ */

router.delete("/:reviewId/comments/:commentId", async (req, res) => {
  try {
    const { reviewId, commentId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review ikke funnet" });
    }

    const comment = review.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Kommentar ikke funnet" });
    }

    comment.deleteOne();
    await review.save();

    res.json(review);
  } catch (err) {
    console.error("FEIL DELETE kommentar:", err);
    res.status(500).json({ message: "Kunne ikke slette kommentar" });
  }
});

/* ============================================================
   ✅ HENT ENKEL REVIEW
============================================================ */

router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review ikke funnet" });
    res.json(review);
  } catch (err) {
    console.error("FEIL /:id:", err);
    res.status(500).json({ message: "Feil ved henting av review" });
  }
});

/* ============================================================
   ✅ UPDATE
============================================================ */

router.put("/:id", async (req, res) => {
  try {
    if (req.body.editorsPick === true) {
      await Review.updateMany({ editorsPick: true }, { editorsPick: false });
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Ikke funnet" });
    res.json(updated);
  } catch (err) {
    console.error("FEIL PUT:", err);
    res.status(500).json({ message: "Feil ved oppdatering" });
  }
});

/* ============================================================
   ✅ DELETE
============================================================ */

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ikke funnet" });
    res.json({ message: "Slettet" });
  } catch (err) {
    console.error("FEIL DELETE:", err);
    res.status(500).json({ message: "Feil ved sletting" });
  }
});

export default router;
