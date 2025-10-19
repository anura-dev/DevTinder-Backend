const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const userConnectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName age gender skills photoUrl about"
    );
    //.populate("fromUserId", ["firstName", "lastName"]);

    res.json({
      message: "Connections received successfully",
      data: userConnectionRequests,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("ERROR::" + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate(
        "fromUserId",
        "firstName lastName age gender skills photoUrl about"
      )
      .populate(
        "toUserId",
        "firstName lastName age gender skills photoUrl about"
      );

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    console.log(data);
    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  /**
        User should see all the user's details except::
        1. his own card
        2. his connections
        3. ignored people
        4. already sent the connection request
    */
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    //Find all connection requests(sent + received)

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    //Add all "unique" users in hideUsersFromFeed Array which we don't want to show in the feed
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    //Now, find all the users in the db except from hideUsersFromFeed array

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } }, //users not in hideUsersFromFeed i.e connections interested/rejected/ignored/accepted & vice versa
        { _id: { $ne: loggedInUser._id } }, // his own card
      ],
    })
      .select("firstName lastName age gender skills photoUrl about")
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userRouter;
