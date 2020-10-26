const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const user = require("../models/user");

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
