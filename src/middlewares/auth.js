const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Unauthorized: No token provided!!!!");
    }
    //verify the token
    const decodedObj = await jwt.verify(token, "DEVTINDER@2025");
    if (!decodedObj) {
      return res.status(401).send("Unauthorized: Invalid token!!!!");
    }

    const { _id } = decodedObj;
    //console.log("Logged in user id:: ", _id);

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(400).send("ERR: " + error.message);
  }
};

// export const userAuth = (req, res, next) => {
//   console.log("Inside user middleware");
//   const authToken = "xyz";
//   const isUserAuthorized = authToken === "xyz"; //dummy check
//   if (isUserAuthorized) {
//     next();
//   } else {
//     res.status(403).send("Forbidden");
//   }
// };

module.exports = { userAuth };
