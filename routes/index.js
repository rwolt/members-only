const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.post(
  "/sign-up",
  body("firstName", "First name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("userName", "Username is required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password is required").trim().isLength({ min: 1 }).escape(),
  body("passwordConfirm", "Password confirmation is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("passwordConfirm").custom((value, { req }) => {
    return value === req.body.password;
  }),
  body("userName").custom(async (value, { req }) => {
    const user = await User.find({ userName: req.body.userName });
    if (user) {
      throw new Error("Username is already in use");
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
      };
      return res.render("index", {
        title: "Sign Up",
        errors: errors.array(),
        user: user,
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        } else {
          try {
            const user = new User({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              userName: req.body.userName,
              password: hashedPassword,
              membershipStatus: "guest",
              isAdmin: false,
            });
            const result = await user.save();
            console.log(result);
            res.redirect("/");
          } catch (err) {
            return next(err);
          }
        }
      });
    }
  }
);

module.exports = router;
