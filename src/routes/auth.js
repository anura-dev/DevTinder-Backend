const express = require("express");
const { validateSignUpData, validateLoginData } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

//Signup ApI to create a new user
authRouter.post("/signup", async (req, res) => {
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

    const savedUser = await user.save(); // Save the user to the database

    const token = await savedUser.getJWT();

    //Add the token to cookie and send the response back to the user

    res.cookie(
      "token",
      token,
      { expires: new Date(Date.now() + 8 * 3600000) },
      { httpOnly: true }
    ); // Set the token in a cookie

    //console.log(newUser);
    res.json({ message: "User saved successfully", data: savedUser }); // Send a success response
  } catch (error) {
    console.error(error);
    res.status(400).send("ERR: " + error.message);
  }
});

//login Api to authenticate a user
authRouter.post("/login", async (req, res) => {
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
        { expires: new Date(Date.now() + 8 * 3600000) },
        { httpOnly: true }
      ); // Set the token in a cookie

      //res.json({ user });
      res.send(user);
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("ERR: " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("Logout successful");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = authRouter;
