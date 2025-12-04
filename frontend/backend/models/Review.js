const mongoose = require("mongoose");

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

  type: {
    type: String,
    enum: ["review", "news", "gotw"],
    default: "review",
  },

  date: {
    type: Date,
    default: Date.now,
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
});

module.exports = mongoose.model("Review", reviewSchema);
