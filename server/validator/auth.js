const { check } = require("express-validator");

exports.userSignUpValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Must a valid Email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 charecters long"),
];

exports.userSignInValidator = [
  check("email").isEmail().withMessage("Must a valid Email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 charecters long"),
];

exports.forgetPasswordValidator = [
  check("email").not().isEmpty().isEmail().withMessage("Must a valid Email"),
];

exports.resetPasswordValidator = [
  check("newPassword")
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be 6 charecters long"),
];
