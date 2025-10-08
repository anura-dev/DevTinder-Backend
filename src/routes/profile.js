const express = require("express");

const { userAuth } = require("../middlewares/auth");
const {
  validateEditProfileData,
  validateEditPassword,
  validateResetPassword,
} = require("../utils/validate");

const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();

//profile api to get user profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid token");
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;
    console.log(loggedInUser);

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    console.log(loggedInUser);
    await loggedInUser.save();
    //res.send(`${loggedInUser.firstName}! Your Profile has been edited successfully`);
    res.json({
      message: `${loggedInUser.firstName}! Your Profile has been edited successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).send("Unauthorized::: Invalid token ");
  }
});

//* PATCH Route: Update Logged-in User's Password
/*
 * PATCH /update-password
 * Body: { email, password, newPassword }
 * Description: Updates the user's password after validating email & current password.
 */

// profileRouter.patch("/profile/password", userAuth, async (req, res) => {
//   try {
//     const { email, password, newPassword } = req.body;

//     if (!email || !password || !newPassword) {
//       return res.status(400).json({
//         error: "email, current password, and new password are required.",
//       });
//     }
//     if (
//       !newPassword ||
//       typeof newPassword !== "string" ||
//       newPassword.trim().length < 2 ||
//       !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{2,}$/.test(newPassword)
//     ) {
//       throw new Error(
//         "New Password must be at least 2 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
//       );
//     }

//     // Find user by emailId
//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     // Compare current password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Current password is incorrect." });
//     }

//     // Hash new password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update password,save into db
//     user.password = hashedPassword;
//     await user.save();

//     res.json({ message: "Password updated successfully!", data: user });
//   } catch (error) {
//     console.error("Password update error:", error);
//     res.status(500).json({ error: "Something went wrong. Please try again." });
//   }
// });

profileRouter.patch("/edit/password", userAuth, async (req, res) => {
  try {
    validateEditPassword(req);
    const { currentPassword, newPassword } = req.body;
    const loggedInUser = req.user;
    const isCurrentPasswordValid = await loggedInUser.validatePassword(
      currentPassword
    );

    if (!isCurrentPasswordValid) {
      throw new Error("currentPassword is incorrect");
    }
    const isSameAsCurrentPassword = await loggedInUser.validatePassword(
      newPassword
    );
    if (isSameAsCurrentPassword) {
      throw new Error(
        "New password cannot be the same as the current password"
      );
    }
    loggedInUser.password = await bcrypt.hash(newPassword, 10);
    await loggedInUser.save();
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.json({
      message: `${loggedInUser.firstName}, your password is changed successfully please login again`,
    });
  } catch (err) {
    res.status(400).json({ message: "Password change failed: " + err.message });
  }
});

// profileRouter.post("/forgot-password/email", async (req, res) => {
//   try {
//     const { emailId } = req.body;
//     if (!emailId || !validator.isEmail(emailId)) {
//       return res.status(400).json({ message: "A valid email is required." });
//     }

//     const user = await User.findOne({ emailId });
//     if (user) {
//       const resetToken = crypto.randomBytes(32).toString("hex");
//       user.resetPasswordToken = crypto
//         .createHash("sha256")
//         .update(resetToken)
//         .digest("hex");
//       user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
//       await user.save();

//       await sendResetPasswordEmail(user.emailId, resetToken);
//     }
//     res.status(200).json({
//       message:
//         "If an account with that email exists, a password reset link has been sent.",
//     });
//   } catch (err) {
//     console.error("FORGOT_PASSWORD_ERROR:", err);
//     res
//       .status(500)
//       .json({ message: "An internal error occurred. Please try again later." });
//   }
// });

// profileRouter.post("/forgot-password/otp", async (req, res) => {
//   try {
//     const { emailId } = req.body;
//     const user = await User.findOne({ emailId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
//     user.resetOTP = crypto
//       .createHash("sha256")
//       .update(String(otp))
//       .digest("hex"); // Hash OTP
//     user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
//     await user.save();
//     await sendOtpEmail(user.emailId, otp);
//     res.status(200).json({ message: "OTP sent to email" });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ message: "Something went wrong. Please try again." });
//   }
// });

// profileRouter.post("/forgot-password/otp-verify", async (req, res) => {
//   try {
//     const { emailId, otp, newPassword } = req.body;
//     const user = await User.findOne({ emailId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if OTP has expired
//     if (!user.resetOTPExpires || user.resetOTPExpires < Date.now()) {
//       return res
//         .status(400)
//         .json({ message: "OTP has expired. Request a new one." });
//     }

//     const hashedOTP = crypto
//       .createHash("sha256")
//       .update(String(otp))
//       .digest("hex");

//     if (hashedOTP !== user.resetOTP) {
//       return res
//         .status(400)
//         .json({ message: "Invalid OTP. Please try again." });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetOTP = undefined;
//     user.resetOTPExpires = undefined;

//     await user.save();
//     res.status(200).json({ message: "Password reset successfully." });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ message: "Something went wrong. Please try again." });
//   }
// });

// profileRouter.post("/reset-password/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword } = req.body;

//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "Invalid or expired link, genrate a new reset link" });
//     }
//     validateResetPassword(req);

//     const isSameAsCurrentPassword = await user.validatePassword(newPassword);
//     if (isSameAsCurrentPassword) {
//       return res.status(400).json({
//         message: "New password cannot be the same as the old password.",
//       });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.clearCookie("token", {
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//     });
//     res
//       .status(200)
//       .json({ message: "Password reset successful. You can now log in." });
//   } catch (err) {
//     console.error("RESET_PASSWORD_ERROR:", err);
//     res
//       .status(500)
//       .json({ message: "An internal error occurred. Please try again later." });
//   }
// });

// profileRouter.delete("/delete", userAuth, async (req, res) => {
//   try {
//     const loggedUser = req.user;
//     await User.findByIdAndDelete(loggedUser._id);
//     res.clearCookie("token", {
//       httpOnly: true,
//       sameSite: "None",
//       secure: true,
//     });
//     res.json({
//       message: `${loggedUser.firstName}, your account has been successfully deleted.`,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Account deletion failed: " + err.message });
//   }
// });

module.exports = profileRouter;
