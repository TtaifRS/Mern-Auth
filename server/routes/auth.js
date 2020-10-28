const express = require("express");
const router = express.Router();

//import controllers
const {
  signup,
  accountActivation,
  signin,
  forgetPassword,
  resetPassword,
  googleLogin,
} = require("../controllers/auth");
const {
  userSignUpValidator,
  userSignInValidator,
  forgetPasswordValidator,
  resetPasswordValidator,
} = require("../validator/auth");
const { runValidation } = require("../validator");

router.post("/signup", userSignUpValidator, runValidation, signup);
router.post("/account-activation", accountActivation);
router.post("/signin", userSignInValidator, runValidation, signin);
router.put(
  "/forget-password",
  forgetPasswordValidator,
  runValidation,
  forgetPassword
);
router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

//google and facebook login
router.post("/google-login", googleLogin);

module.exports = router;
