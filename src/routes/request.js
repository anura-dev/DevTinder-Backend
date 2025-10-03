const express = require("express");
const { adminAuth } = require("../middlewares/auth");

const requestRouter = express.Router();

requestRouter.post("/sendConnectionRequest", adminAuth, async (req, res) => {
  try {
    console.log("Connections sent");
    res.send("Sent message to Connections");
  } catch (error) {
    console.error(error);
    res.status(400).send("ERR: " + error.message);
  }
});

module.exports = requestRouter;
