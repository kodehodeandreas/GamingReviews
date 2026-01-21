import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: false,
  },

  title: {
    type: String,
    required: true,
  },

  summary: {
    type: String,
    default: "",
  },

  feedSummary: {
    type: String,
    deffault: "",
  },

  content: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
    required: false,
  },

  secondaryImageUrl: {
    type: String,
    default: "",
  },

  type: {
    type: String,
    enum: ["review", "news", "gotw"],
    default: "review",
  },

  // ✅ Editors Pick flag
  editorsPick: {
    type: Boolean,
    default: false,
  },

  platforms: {
    type: [String],
    default: [],
  },

  galleryImages: {
    type: [String],
    default: [],
  },

  pros: {
    type: [String],
    default: [],
  },

  cons: {
    type: [String],
    default: [],
  },

  rating: {
    type: Number,
    default: null,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  comments: {
    type: [
      {
        author: { type: String, required: true },
        text: { type: String, required: true },
        isAdmin: {
          type: Boolean,
          default: false,
        },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
});

export default mongoose.model("Review", reviewSchema);
