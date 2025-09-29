const express = require("express");
const { adminAuth, userAuth } = require("./middlewares/auth");
const app = express();

//app.use is used to define routes that handle all HTTP methods.
//app.METHOD is used to define routes that handle specific HTTP methods (GET, POST, PUT, DELETE, etc.)
//app.all is used to handle all HTTP methods for a specific route. It is called for every request to the specified route, regardless of the HTTP method.
//app.use vs app.all is that app.use is used to define middleware and routes, while app.all is specifically for handling all HTTP methods for a particular route.
//......................................................................

app.use("/admin", adminAuth);

//app.use("/user", userAuth);

//userAuth middleware is applied only to the /user/getUserData route.
app.get("/user/getUserData", userAuth, (req, res) => {
  res.send("Get user data");
});
app.get("/user/getUserPosts", userAuth, (req, res) => {
  res.send("Get user posts");
});

app.post("/user/createPost", (req, res) => {
  res.send("Created post for user");
});
//......................................................................
app.get("/admin/getAllData", (req, res) => {
  res.send("Get all data");
});
app.post("/admin/createUser", (req, res) => {
  res.send("Created user");
});

app.delete("/admin/deleteUser", (req, res) => {
  res.send("Deleted user");
});

app.listen(7777, () => {
  console.log("Server is running on port 7777");
});
