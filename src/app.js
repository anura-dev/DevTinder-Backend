const express = require("express");
require("./config/database");

const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();
app.use(express.json());

//signup api to create a new user
app.post("/signup", async (req, res) => {
  //Creating new instance of User model
  //console.log(req.body);
  const user = new User(req.body);

  //   const user = new User({
  //     firstName: "Nirvika",
  //     lastName: " Mohniya",
  //     email: "nirvika@example.com",
  //     password: "nirvika123",
  //   });
  try {
    const newUser = await user.save(); // Save the user to the database
    //console.log(newUser);
    res.send("User saved successfully"); // Send a success response
  } catch (error) {
    console.error(error);
    res.status(400).send("Bad Request: " + error.message);
  }
});

//get all users by email (find{email})
app.get("/user", async (req, res) => {
  const userEmail = req.body.email;
  console.log("userEmail:: ", userEmail);
  try {
    const users = await User.find({ email: userEmail });
    if (users.length === 0) {
      return res.status(404).send("No users found with the provided email");
    } else {
      res.send(users);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//get one user by email (findOne({email}))
app.get("/userone", async (req, res) => {
  const userEmail = req.body.email;
  console.log("userEmail:: ", userEmail);
  try {
    const user = await User.findOne({ email: userEmail }); // Fetch one user by email
    //const user = await User.findOne(); // if no condition is passed it will return first document
    if (!user) {
      return res.status(404).send("No user found with the provided email");
    } else {
      res.send(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//feed api to get all users (find()) (read)
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//delete user by id (findByIdAndDelete(id))

app.delete("/user", async (req, res) => {
  const userId = req.body.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    //const deletedUser = await User.findByIdAndDelete(_id: userId); // if no condition is passed it will delete first document
    if (!deletedUser) {
      return res.status(404).send("No user found with the provided id");
    } else {
      res.send("User deleted successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//delete user by email (findOneAndDelete({email}))
//(deleteOne({email})) //deleteOne is similar to findOneAndDelete
app.delete("/useremail", async (req, res) => {
  const userEmail = req.body.email;

  try {
    const deletedUser = await User.deleteOne({ email: userEmail }); //if two users have same email it will delete first one
    if (!deletedUser) {
      return res.status(404).send("No user found with the provided email");
    } else {
      res.send("User deleted successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//deleteMany({email}) //delete all users with same email
app.delete("/useremails", async (req, res) => {
  const userEmail = req.body.email;

  try {
    const deletedUsers = await User.deleteMany({ email: userEmail });
    if (deletedUsers.deletedCount === 0) {
      return res.status(404).send("No users found with the provided email");
    } else {
      res.send("Users deleted successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//update user by id (findByIdAndUpdate(id, update))
//PUT vs PATCH
//PUT - update entire document
//PATCH - update specific fields
app.patch("/user/:id", async (req, res) => {
  const userId = req.params?.id;
  const updateData = req.body; // { firstName: "NewFirstName", age: 25 }
  //console.log("updateData:: ", updateData);

  try {
    const ALLOWED_UPDATES = ["age", "gender", "photoUrl", "skills", "about"];
    const requestedUpdates = Object.keys(updateData);
    console.log("requestedUpdates:: ", requestedUpdates);
    //validation for allowed updates
    const isValidOperation = requestedUpdates.every((update) =>
      ALLOWED_UPDATES.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).send("Invalid updates");
    }

    if (updateData?.skills.length > 5) {
      return res.status(400).send("You can add maximum 5 skills");
    }

    if (updateData?.age) {
      if (updateData.age < 18 || updateData.age > 65) {
        return res.status(400).send("Age must be between 18 and 65");
      }
    }

    if (updateData?.gender) {
      const validGenders = ["male", "female", "other"];
      if (!validGenders.includes(updateData.gender)) {
        return res.status(400).send("Invalid gender");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }); //new:true will return updated document
    if (!updatedUser) {
      return res.status(404).send("No user found with the provided id");
    } else {
      res.send(updatedUser);
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("Bad Request: " + error.message);
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
