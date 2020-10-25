const mongoose = require("mongoose");
const crypto = require("crypto");

//user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: String,
      default: "subscriber",
    },
    forgetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

// virtuals
userSchema
  .virtual("password")
  .set(function (password) {
    //create a temporary variable with _password
    this._password = password;
    //generate salt
    this.salt = this.makeSalt();
    //encrypted password
    this.hashed_password = this.encryptedPassword(password);
  })
  .get(function () {
    return this._password;
  });

//methods
userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptedPassword(plainText) === this.hashed_password;
  },
  encryptedPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

module.exports = mongoose.model("User", userSchema);
