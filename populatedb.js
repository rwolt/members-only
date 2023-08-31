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
  await createActivationCode();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

const activationCodeExample = {
  code: "TOPROCKS!",
  isValid: "true",
};

const createActivationCode = async () => {
  const hashedCode = bcrypt.hashSync(activationCodeExample.code, 10);
  const hashedActivationCode = new MemberCode({
    ...activationCodeExample,
    code: hashedCode,
  });
  await hashedActivationCode.save();
  console.log("Added Activation Code: ", hashedActivationCode);
};
