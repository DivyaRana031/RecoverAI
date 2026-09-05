require("dotenv").config();

const mongoose = require("mongoose");
const { retrievePolicies } = require("./retrieval");

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const query =
      "The customer's payment failed because of a temporary network problem.";

    console.log("\nQuery:");
    console.log(query);

    const policies = await retrievePolicies(query, 3);

    console.log("\nRelevant policies:\n");

    policies.forEach((policy, index) => {
      console.log(`${index + 1}. ${policy.title}`);
      console.log(`Category: ${policy.category}`);
      console.log(`Score: ${policy.score}`);
      console.log(`Content: ${policy.content}`);
      console.log("-----------------------------------");
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Test failed:", error.message);
    await mongoose.disconnect();
  }
};

test();