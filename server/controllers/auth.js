const User = require("../models/user");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const { response } = require("express");

sgMail.setApiKey(process.env.SENDGRID_API);

// // exports.signup = (req, res) => {
// //   const { name, email, password } = req.body;

// //   User.findOne({ email }).exec((err, user) => {
// //     if (user) {
// //       return res.status(400).json({
// //         error: "Email is taken",
// //       });
// //     }

// //     let newUser = new User({ name, email, password });

// //     newUser.save((err, success) => {
// //       if (err) {
// //         console.log("SignUp error", err);
// //         return res.status(400).json({
// //           error: err,
// //         });
// //       }
// //       res.json({
// //         message: "signup completed",
// //       });
// //     });
// //   });
// // };

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "10m" }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account activation link`,
      html: `
        <h2>Please use the following link to activate your account</h2>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr />
        <p>This email may contain sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>
        `,
    };
    sgMail
      .send(emailData)
      .then((sent) => {
        // console.log('SIGNUP EMAIL SENT', sent)
        return res.json({
          message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
        });
      })
      .catch((err) => {
        // console.log('SIGNUP EMAIL SENT ERROR', err)
        return res.json({
          message: err.message,
        });
      });
  });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (
      err,
      decoded
    ) {
      if (err) {
        console.log("Activation error", err);
        return res.status(401).json({
          error: "Expired Link, please sign up again",
        });
      }

      const { name, email, password } = jwt.decode(token);
      const user = new User({ name, email, password });

      user.save((err, user) => {
        if (err) {
          console.log("Save User in database activation error", err);
          return res.status(401).json({
            error: "Error saving user in database, please sign up again",
          });
        }
        return res.json({
          message: "Sign up success, please sign in",
        });
      });
    });
  } else {
    return res.json({
      message: "Something went wrong, try again",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  //check if the user exist
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with this email doesn't exist, please Sign Up",
      });
    }
    // authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and Password do not match",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

//admin middleware

exports.adminMiddleware = (req, res, next) => {
  User.findOne({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    if (user.role !== "admin") {
      return res.status(400).json({
        error: "Admin resource, access denied",
      });
    }

    req.profile = user;
    next();
  });
};

exports.forgetPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not found",
      });
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "10m",
      }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Pasword Reset link`,
      html: `
        <h2>Please use the following link to reset your account</h2>
        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
        <hr />
        <p>This email may contain sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>
        `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        console.log("Reset password link error", err);
        return res.status(400).json({
          error: "Database connection error on Forget password request",
        });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            // console.log('SIGNUP EMAIL SENT', sent)
            return res.json({
              message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
            });
          })
          .catch((err) => {
            // console.log('SIGNUP EMAIL SENT ERROR', err)
            return res.json({
              message: err.message,
            });
          });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      (err, decoded) => {
        if (err) {
          return res.status(400).json({
            error: "Reset password link expired, please try again",
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: "Something went wrong, try later",
            });
          }
          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };

          user = _.extend(user, updatedFields);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "Error reseting user password",
              });
            }
            res.json({
              message: "Great! Now you can log in with new password",
            });
          });
        });
      }
    );
  }
};

//google oAuth
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
  const { idToken } = req.body;

  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          } else {
            function generatePassword() {
              let length = 8,
                charset =
                  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
              for (let i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
              }
              return retVal;
            }
            let password = generatePassword();
            user = new User({ name, email, password });
            user.save((err, userData) => {
              if (err) {
                return res.status(400).json({
                  error: "user signup failed with google",
                });
              }
              const token = jwt.sign(
                { _id: userData._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );
              const { _id, email, name, roll } = userData;
              return res.json({
                token,
                user: { _id, email, name, roll },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed, try again!",
        });
      }
    });
};
