const mongoose = require("mongoose");
const Schema = mongoose.Schema;

MessageSchema = new Schema({
  timestamp: { type: Date, required: true },
  title: { type: String, required: true, maxLength: 100 },
  text: { type: String, required: true, maxLength: 480 },
});

MessageSchema.virtual("timestampString").get(() => {
  const date = this.timestamp.toLocaleDateString();
  const time = this.timestamp.toLocaleTimeString().slice(0, 5);
  const period = timestamp.getHours() >= 12 ? "AM" : "PM";
  return `${date} ${time} ${period}`;
});

module.exports = mongoose.model("Message", MessageSchema);
