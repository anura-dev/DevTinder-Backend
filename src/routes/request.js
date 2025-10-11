const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(404).json({ message: "Invalid status" });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!!" });
      }

      //if same entry already present in the db OR reverse is same [ i.e Anura to Mark is there OR Mark to Anura is there]
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection already exists in the database" });
      }

      const ConnData = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        ConnData,
      });
      //res.send("Sent message to Connections");
    } catch (error) {
      console.error(error);
      res.status(400).send("ERR: " + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;

      //Suppose Anura has sent "interested" request to Elon
      //requestId:: id of the user who has sent the request (Anura) [ObjectId of the connection request] (68e9fad0505f944ba7556abd)
      //loggedInUser id:: id of the user who has received the request (Elon)

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status invalid" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();
      res.json({
        message: "Connection request " + status,
        //toUserId.firstName + " is " + status + " by " + req.user.firstName,
        data,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send("ERR: " + err.message);
    }
  }
);

module.exports = requestRouter;
