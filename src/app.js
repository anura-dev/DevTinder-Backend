const express = require("express");
require("./config/database");

const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData, validateLoginData } = require("./utils/validate");
const { adminAuth } = require("./middlewares/auth");
const bcrypt = require("bcrypt");

const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

//Signup ApI to create a new user
app.post("/signup", async (req, res) => {
  //Creating new instance of User model
  //console.log(req.body);
  try {
    validateSignUpData(req); // Validate user data

    //Encrypt password before saving to database
    const { firstName, lastName, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save(); // Save the user to the database
    //console.log(newUser);
    res.send("User saved successfully"); // Send a success response
  } catch (error) {
    console.error(error);
    res.status(400).send("ERR: " + error.message);
  }
});

//profile api to get user profile
app.get("/profile", adminAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid token");
  }
});

//login Api to authenticate a user
app.post("/login", async (req, res) => {
  //Creating new instance of User model

  try {
    validateLoginData(req); // Reuse validation for email and password
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    // console.log("user:: ", user);
    if (!user) {
      return res.status(404).send("User not found. Invalid credentials");
    }

    // Check password

    const isPasswordMatch = await user.validatePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).send("Invalid credentials");
    } else {
      const token = await user.getJWT();

      //Add the token to cookie and send the response back to the user

      res.cookie(
        "token",
        token,
        { expires: new Date(Date.now() + 2 * 3600000) },
        { httpOnly: true }
      ); // Set the token in a cookie

      res.send("Login successful");
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("ERR: " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("DB Connection Successful");
    app.listen(7777, () => {
      console.log("Server is running on port 7777");
    });
  })
  .catch((err) => {
    console.log("DB Connection Failed", err);
  });
