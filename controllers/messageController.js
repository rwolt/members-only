const { body, validationResult } = require("express-validator");
const Message = require("../models/message");

exports.message_create_get = (req, res, next) => {
  res.render("message", { title: "Members Only New Message" });
};

exports.message_create_post = [
  body("title", "Title is required").trim().isLength({ min: 1 }).escape(),
  body("title", "Message text is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = {
        title: req.body.title,
        text: req.body.text,
      };
      return res.render("message", {
        title: "Members Only New Message",
        errors: errors.array(),
        message: message,
      });
    } else {
      const timestamp = new Date();
      const newMessage = new Message({
        title: req.body.title,
        text: req.body.text,
        timestamp: timestamp,
        user: req.user._id,
      });
      try {
        const result = await newMessage.save();
        console.log(result);
        res.redirect("/home");
      } catch (err) {
        return next(err);
      }
    }
  },
];
