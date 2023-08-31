const express = require("express");
const router = express.Router();
const message_controller = require("../controllers/messageController");

// MESSAGE ROUTES

router.get("/", message_controller.message_create_get);

router.post("/", message_controller.message_create_post);

module.exports = router;
