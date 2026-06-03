const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://haidet0000_db_user:Haider1526@cluster0.9ymnwwt.mongodb.net/jobtracker");
        console.log("MongoDB Connected");
    } catch (error) {
        console.log("DB Error:", error);
    }
};

module.exports = connectDB;