const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});

router.get("/sign-up", (req, res, next) => {
  res.render("sign-up", { title: "Members Only Sign Up" });
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
    console.log(user);
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
              username: req.body.username,
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

router.get("/login", (req, res, next) => {
  res.render("login", { title: "Members Only Login" });
});

router.post(
  "/login",
  // body("username", "Username is required").trim().isLength({ min: 1 }).escape(),
  // body("password", "Password is required").trim().isLength({ min: 1 }).escape(),
  // (req, res, next) => {
  //   console.log("login post"), console.log(req.body);
  passport.authenticate("local", {
    successRedirect: "/posts",
    failureRedirect: "/",
  })
  // }
);

router.get("/posts", (req, res, next) => {
  res.render("posts", { title: "Members Only" });
});

module.exports = router;
