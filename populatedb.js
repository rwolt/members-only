#! /usr/bin/env node
const bcrypt = require("bcryptjs");

console.log("This script populates the database with a member code");

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const MemberCode = require("./models/activationCode");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createActivationCodes();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

const memberActivationCodeExample = {
  accessType: "member",
  code: "TOPRocks!",
  isValid: "true",
};

const adminActivationCodeExample = {
  accessType: "admin",
  code: "greentea123",
  isValid: "true",
};

const createActivationCodes = async () => {
  console.log("Creating activation codes");
  await createActivationCode(memberActivationCodeExample);
  await createActivationCode(adminActivationCodeExample);
};

const createActivationCode = async (activationCode) => {
  const hashedCode = bcrypt.hashSync(activationCode.code, 10);
  const hashedActivationCode = new MemberCode({
    ...activationCode,
    hashedCode: hashedCode,
  });
  await hashedActivationCode.save();
  console.log("Added Activation Code: ", hashedActivationCode);
};
