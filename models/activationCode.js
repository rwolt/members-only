const mongoose = require("mongoose");
const Schema = mongoose.Schema;

ActivationCodeSchema = new Schema({
  accessType: { type: String, enum: ["member", "admin"] },
  hashedCode: { type: String, required: true },
  isValid: { type: Boolean, required: true },
});

module.exports = mongoose.model("ActivationCode", ActivationCodeSchema);
