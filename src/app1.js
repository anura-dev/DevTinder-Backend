const express = require("express");
const app = express();
const port = 7777;

//order of routes matter. More specific routes should be defined before less specific ones.

//app.get is used to define routes that specifically handle GET requests.
// /ab+c = /abc, /abbc, /abbbc => b occurs one or more times
// /ab?c = /ac, /abc ==> b is optional
// /ab?cd = /acd, /abcd ==> b is optional
// /ab*c = /abxxxxc => b occurs zero or more times
// /ab(c|d) = /abc, /abd ==> either c or d
// /a.b = /a_b, /a-b, /aXb ==> . matches any single character
// /ab+cd = /abcd, /abbcd, /abbbcd ==> b occurs one or more times

app.get("/abc", (req, res) => {
  res.send({ first_name: "ANura", last_name: "Doe" });
});

//route parameters
// /user/:userid/:name/:password
// req.params = { userid: '123', name: 'anura', password: '1234' }
app.get("/user/:userid/:name/:password", (req, res) => {
  res.send({ first_name: "ANura", last_name: "Doe" });
  console.log(req.params);
});

//route handlers

//middleware functions can be defined to handle a route.
// middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.
// the next middleware function is commonly denoted by a variable named next.

// e.g:: app.use('/test', [cb1, cb2], cb3, cb4)
// you can define multiple callback functions that behave like middleware to handle a route.
// you can also define an array of callback functions to handle a route.
// you can also mix and match the two.
// all the callback functions should call next() to pass the control to the next callback function.
// if a callback function does not call next(), the request will be left hanging.
// if a callback function sends a response, the request will be left hanging unless next() is called before sending the response.
// if a callback function sends a response, the subsequent callback functions will not be executed unless next() is called before sending the response.
// you can also use app.use() to define routes that handle all HTTP methods.
app.use(
  "/test",
  (req, res, next) => {
    console.log("Inside test middleware");
    next();
    res.send("Test middleware");
  },
  (req, res, next) => {
    next();
    console.log("Inside test middleware 2");
    // res.send("Test middleware 2");
  },
  (req, res, next) => {
    console.log("Inside test middleware 3");
    //res.send("Test middleware 3");
    //next();
  }
);

//handling different HTTP methods with next()

//can also be written as app.get('/handlingnext', (req, res, next) => {...}, (req, res, next) => {...}, ...)  ==> multiple callback functions for the same HTTP method
//can also be written as app.route('/handlingnext').get((req, res, next) => {...}).post((req, res, next) => {...}).delete((req, res, next) => {...}) //multiple HTTP methods for the same route
//can also be written as app.route('/handlingnext').all((req, res, next) => {...}) to handle all HTTP methods
//can also be written as app.route('/handlingnext').get((req, res, next) => {...}).post((req, res, next) => {...}).delete((req, res, next) => {...}).all((req, res, next) => {...}) //multiple HTTP methods and all methods for the same route

//next() is used to pass the control to the next callback function.
app.route("/handlingnext").get((req, res, next) => {
  console.log("Inside test route GET");
  //res.send("handling get next method");
  next();
});
app.route("/handlingnext").get((req, res, next) => {
  console.log(" 2nd Inside test route GET");
  res.send("2nd handling get next method");
  next();
});
app.route("/handlingnext").get((req, res, next) => {
  console.log(" 3rd Inside test route GET");
  //res.send("3rd handling get next method");
  //next();
});

//......................................................................
app.route("/handlingnext").post((req, res, next) => {
  console.log("Inside test route POST");
  res.send("handling post next method");
  next();
});
app.route("/handlingnext").delete((req, res, next) => {
  console.log("Inside test route DELETE");
  res.send("handling next method");
  next();
});

//......................................................................
// chaining route handlers for the same HTTP method using .route()
// You can chain multiple route handlers for the same HTTP method using app.route().
// This is useful when you want to handle multiple middleware functions for the same HTTP method.
// Each handler should call next() to pass the control to the next handler.
// If a handler sends a response, the subsequent handlers will not be executed unless next() is called before sending the response.
app
  .route("/handlingnextInOne")
  .get((req, res, next) => {
    console.log("GET method");
    // res.send("handling get method");
    next();
  })
  .get((req, res, next) => {
    console.log("2nd GET method");
    res.send("2nd handling get method");
    //next();
  })
  .post((req, res, next) => {
    console.log("POST method");
    res.send("handling post method");
    //next();
  })
  .delete((req, res, next) => {
    console.log("DELETE method");
    res.send("handling delete method");
    ///next();
  });

//......................................................................
// .all() is used to handle all HTTP methods.
// It is called for every request to the specified route, regardless of the HTTP method.
// It is typically used for middleware that needs to be executed for all requests to a route.
app.route("/handlingnextall").all((req, res, next) => {
  console.log("Inside test route ALL METHODS");
  res.send("handling all next method");
  next();
});

//......................................................................
//handling different HTTP methods for the same route
app.route("/route").get((req, res) => {
  res.send({ first_name: "Nirvika", last_name: "Mohniya" });
});
app.route("/route").post((req, res) => {
  res.send("route post method");
});
app.route("/route").delete((req, res) => {
  res.send("route delete method");
});

//order of routes matter. More specific routes should be defined before less specific ones.

//app.get is used to define routes that specifically handle GET requests.
app.get("/user", (req, res) => {
  res.send({ first_name: "John", last_name: "Doe" });
});

app.post("/user", (req, res) => {
  res.send("user route post method");
});

app.delete("/user", (req, res) => {
  res.send("user route delete method");
});

//app.use is used to define middleware and routes in Express.js.
//It can handle all HTTP methods (GET, POST, PUT, DELETE, etc.) for the specified path.

app.use("/test/2", (req, res) => {
  res.send("test route 2 use method");
});
app.use("/test", (req, res) => {
  res.send("test route use method");
});

/// app.use("/main", (req, res) => {
//   res.send("main route");
// });

// app.use("/", (req, res) => {
//   res.send("Dashboard route");
// });

app.listen(port, () => {
  console.log("Server started running on port " + port);
});
