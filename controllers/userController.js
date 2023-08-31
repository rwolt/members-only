const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user");

// USER LOGIN CONTROLLERS

exports.user_login_get = (req, res, next) => {
  res.render("login", { title: "Members Only Login" });
};

exports.user_login_post = [
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res, next) => {
    res.redirect("/home");
  },
];

// USER LOGOUT CONTROLLER

exports.user_logout_post = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/home");
  });
};

// USER REGISTER CONTROLLERS

exports.user_register_get = (req, res, next) => {
  res.render("register", { title: "Members Only Registration" });
};

exports.user_register_post = [
  body("firstName", "First name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Username is required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password is required").trim().isLength({ min: 1 }).escape(),
  body("passwordConfirm", "Password confirmation is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("passwordConfirm").custom((value, { req }) => {
    return value === req.body.password;
  }),
  body("username").custom(async (value) => {
    const user = await User.findOne({ username: value });
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
        username: req.body.username,
      };
      return res.render("register", {
        title: "Members Only Registration",
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
              username: req.body.username,
              password: hashedPassword,
              membershipStatus: "guest",
              isAdmin: false,
            });
            const result = await user.save();
            res.redirect("/");
          } catch (err) {
            return next(err);
          }
        }
      });
    }
  },
];

// USER ACTIVATE MEMBERSHIP CONTROLLERS

exports.user_activate_membership_get = (req, res, next) => {
  res.render("activate-membership", {
    title: "Members Only Activate Membership",
  });
};
