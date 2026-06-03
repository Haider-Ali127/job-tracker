const mongoose = require("mongoose");

const cvSchema = new mongoose.Schema({
    extractedText: String,
    skills: [String],
    recommendedJobs: Array
}, { timestamps: true });

module.exports = mongoose.model("CV", cvSchema);