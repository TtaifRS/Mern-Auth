const express = require("express");
const router = express.Router();

//import controllers
const { signup, accountActivation, signin } = require("../controllers/auth");
const {
  userSignUpValidator,
  userSignInValidator,
} = require("../validator/auth");
const { runValidation } = require("../validator");

router.post("/signup", userSignUpValidator, runValidation, signup);
router.post("/account-activation", accountActivation);
router.post("/signin", userSignInValidator, runValidation, signin);

module.exports = router;
