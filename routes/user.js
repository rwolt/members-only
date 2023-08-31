const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController");
// USER ROUTES

router.get("/login", user_controller.user_login_get);

router.post("/login", user_controller.user_login_post);

router.post("/logout", user_controller.user_logout_post);

router.get("/register", user_controller.user_register_get);

router.post("/register", user_controller.user_register_post);

router.get(
  "/activate-membership",
  user_controller.user_activate_membership_get
);

module.exports = router;
