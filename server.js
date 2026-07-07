require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static("public"));

connectDB();

const jobRoutes = require("./routes/jobs");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/jobs", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "jobs.html"));
});

app.use("/", jobRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});