const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Message = require("../models/message");

// HOME PAGE ROUTES

router.get("/", (req, res, next) => {
  res.redirect("/home");
});

router.get("/home", async (req, res, next) => {
  if (
    (req.isAuthenticated() && req.user.membershipStatus === "member") ||
    (req.isAuthenticated() && req.user.isAdmin)
  ) {
    try {
      const messages = await Message.find({}).populate("user");
      res.render("home", { title: "Members Only", messages: messages });
    } catch (err) {
      return next(err);
    }
  } else if (req.isAuthenticated() && req.user.membershipStatus === "guest") {
    try {
      const messages = await Message.find({}).populate("user");
      const hashedMessages = messages.map((message) => {
        const hashedFirstName = bcrypt.hashSync(message.user.firstName, 10);
        const hashedLastName = bcrypt.hashSync(message.user.lastName, 10);
        const hashedTimestamp = bcrypt.hashSync(
          message.timestamp.toString(),
          10
        );
        return {
          title: message.title,
          text: message.text,
          timestamp: hashedTimestamp,
          user: {
            firstName: hashedFirstName,
            lastName: hashedLastName,
          },
        };
      });
      console.log(hashedMessages);
      res.render("home", { title: "Members Only", messages: hashedMessages });
    } catch (err) {
      return next(err);
    }
  } else {
    res.render("home", { title: "Members Only" });
  }
});

module.exports = router;
