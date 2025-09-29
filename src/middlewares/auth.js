export const adminAuth = (req, res, next) => {
  console.log("Inside admin middleware");
  const authToken = "xyz";
  const isAdminAuthorized = authToken === "xyz"; //dummy check
  if (isAdminAuthorized) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
};

export const userAuth = (req, res, next) => {
  console.log("Inside user middleware");
  const authToken = "xyz";
  const isUserAuthorized = authToken === "xyz"; //dummy check
  if (isUserAuthorized) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
};
