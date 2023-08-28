const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: { type: String, required: true, maxLength: 24 },
  password: { type: String, required: true, maxLength: 72 },
  firstName: { type: String, required: true, maxLength: 30 },
  lastName: { type: String, required: true, maxLength: 30 },
  membershipStatus: {
    type: String,
    enum: ["guest", "member"],
    required: true,
  },
  isAdmin: { type: Boolean, required: true },
});

UserSchema.virtual("fullName").get(() => {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", UserSchema);
