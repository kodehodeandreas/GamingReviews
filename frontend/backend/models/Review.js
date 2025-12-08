import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  gameId: { type: String },

  title: { type: String, required: true },
  summary: { type: String, default: "" },
  content: { type: String, required: true },

  imageUrl: { type: String },
  secondaryImageUrl: { type: String, default: "" },

  type: {
    type: String,
    enum: ["review", "news", "gotw"],
    default: "review",
  },

  editorsPick: {
    type: Boolean,
    default: false,
  },

  date: { type: Date, default: Date.now },

  galleryImages: { type: [String], default: [] },
  platforms: { type: [String], default: [] },

  pros: { type: [String], default: [] },
  cons: { type: [String], default: [] },
  rating: { type: Number, default: null },
});

export default mongoose.model("Review", reviewSchema);
