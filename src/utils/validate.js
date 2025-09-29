const validator = require("validator");

// Function to validate user data

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;
  //const errors = [];
  if (
    !firstName ||
    typeof firstName !== "string" ||
    firstName.trim().length < 2 ||
    firstName.trim().length > 50 ||
    !/^[a-zA-Z]+$/.test(firstName)
  ) {
    throw new Error(
      "First name should be a string containing only letters, with length between 2 and 50 characters."
    );
  } else if (
    !lastName ||
    typeof lastName !== "string" ||
    lastName.trim().length < 2 ||
    lastName.trim().length > 50 ||
    !/^[a-zA-Z]+$/.test(lastName)
  ) {
    throw new Error(
      "Last name should be a string containing only letters, with length between 2 and 50 characters."
    );
  } else if (!email || typeof email !== "string" || !validator.isEmail(email)) {
    throw new Error("Invalid email address.");
  } else if (
    !password ||
    typeof password !== "string" ||
    password.trim().length < 2 ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{2,}$/.test(password)
  ) {
    throw new Error(
      "Password must beeee at least 2 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
    );
  }
};

const validateLoginData = (req) => {
  const { email, password } = req.body;
  if (!email || typeof email !== "string" || !validator.isEmail(email)) {
    throw new Error("Invalid email address.");
  }
  if (
    !password ||
    typeof password !== "string" ||
    password.trim().length < 2 ||
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{2,}$/.test(password)
  ) {
    throw new Error("Invalid password.");
  }
};

module.exports = { validateSignUpData, validateLoginData };
