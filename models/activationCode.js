const mongoose = require("mongoose");
const Schema = mongoose.Schema;

ActivationCodeSchema = new Schema({
  hashedCode: { type: String, required: true },
  isValid: { type: Boolean, required: true },
});

module.exports = mongoose.model("ActivationCode", ActivationCodeSchema);
