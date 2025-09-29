const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      minlength: 2,
      match: [/^[a-zA-Z]+$/, "First name should contain only letters"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true, // Remove whitespace
      maxlength: 50,
      minlength: 2,
      match: [/^[a-zA-Z]+$/, "Last name should contain only letters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // Remove whitespace
      //match: [/.+\@.+\..+/, "Please fill a valid email address"],
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      // You might want to add more validation for password strength
      validate: {
        validator: function (v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(v);
        },
        message:
          "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
      },
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    gender: {
      type: String,
      //   validate(value) {
      //     const validGenders = ["male", "female", "other"];
      //     if (!validGenders.includes(value)) {
      //       throw new Error("Invalid gender");
      //     }
      //   },
      enum: ["male", "female", "other"],
      lowercase: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "https://example.com/default-profile.png",
      ///match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/, "Please fill a valid URL"],
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error("Invalid URL");
        }
      },
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return (
            Array.isArray(v) && v.every((skill) => typeof skill === "string")
          );
        },
        message: "Skills must be an array of strings",
      },
    },
    about: {
      type: String,
      default: "No bio available",
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
