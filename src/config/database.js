const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://mongo_db_user:k6JEkvEK64SDp1jN@practicenode.yezgkfa.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
