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

  galleryImages: {
    type: [String],
    default: [],
  },

  platforms: {
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

  type: {
    type: String,
    enum: ["review", "news", "gotw"],
    default: "review",
  },

  editorsPick: {
    type: Boolean,
    default: false,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Review", reviewSchema);
