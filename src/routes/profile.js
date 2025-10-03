const express = require("express");

const { adminAuth } = require("../middlewares/auth");

const profileRouter = express.Router();

//profile api to get user profile
profileRouter.get("/profile", adminAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid token");
  }
});

module.exports = profileRouter;
