const express = require("express");
const router = express.Router();
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
      const messages = await Message.find({})
        .populate("user")
        .sort({ timestamp: -1 });
      res.render("home", {
        title: "Members Only",
        messages: messages,
      });
    } catch (err) {
      return next(err);
    }
  } else {
    try {
      const messages = await Message.find({})
        .populate("user")
        .sort({ timestamp: -1 });
      const redactedMessages = messages.map((message) => {
        const regex = /\S/g;
        const redactedText = message.text.replace(regex, "*");
        const redactedFirstName = message.user.firstName.replace(regex, "*");
        const redactedLastName = message.user.lastName.replace(regex, "*");
        const redactedTimestamp = message.timestamp
          .toLocaleTimeString()
          .replace(regex, "*");
        return {
          title: message.title,
          text: redactedText,
          timestamp: redactedTimestamp,
          user: {
            firstName: redactedFirstName,
            lastName: redactedLastName,
          },
        };
      });
      res.render("home", { title: "Members Only", messages: redactedMessages });
    } catch (err) {
      return next(err);
    }
  }
});

module.exports = router;
