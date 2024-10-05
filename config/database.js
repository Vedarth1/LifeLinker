const mongoose = require("mongoose");

const dbconnect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Database connection successful!");
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
};

module.exports = dbconnect;
