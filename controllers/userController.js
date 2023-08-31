const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user");
const ActivationCode = require("../models/activationCode");

// USER LOGIN CONTROLLERS

exports.user_login_get = (req, res, next) => {
  res.render("login", { title: "Members Only Login" });
};

exports.user_login_post = [
  passport.authenticate("local", {
    failureRedirect: "/users/login",
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
            await user.save();

            // Login automatically after registration
            req.login(user, (err) => {
              if (!err) {
                res.redirect("/home");
              } else {
                return next(err);
              }
            });
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

exports.user_activate_membership_update = async (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.membershipStatus === "member") ||
    (req.isAuthenticated() && req.user.isAdmin)
  ) {
    const error = new Error("User is already a member");
    return next(error);
  }
  const activationCode = await ActivationCode.findOne({
    accessType: "member",
  });
  console.log(activationCode);
  if (!activationCode) {
    const error = new Error("No activation code found");
    return next(error);
  }
  if (!activationCode.isValid) {
    const error = new Error("Activation code has already been used");
    return next(error);
  }
  const match = await bcrypt.compare(req.body.code, activationCode.hashedCode);
  if (!match) {
    const error = new Error("Not a valid activation code");
    return next(error);
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      membershipStatus: "member",
    });
    res.redirect("/home");
  }
};

// USER ADMIN ACCESS CONTROLLERS

exports.user_admin_get = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("admin", { title: "Members Only Admin" });
  } else {
    res.redirect("/home");
  }
};

exports.user_admin_post = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.membershipStatus === "member") {
    res.redirect("/");
  } else {
    const activationCode = await ActivationCode.findOne({
      accessType: "admin",
    });
    if (!activationCode) {
      const error = new Error("Access code does not exist");
      return next(error);
    }
    if (!activationCode.isValid) {
      const error = new Error("Access code is no longer valid");
      return next(error);
    }
    const match = await bcrypt.compare(
      req.body.code,
      activationCode.hashedCode
    );
    if (!match) {
      const error = new Error("Access code does not match");
      return next(error);
    } else {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          isAdmin: true,
        });
        res.redirect("/home");
      } catch (err) {
        return next(err);
      }
    }
  }
};
