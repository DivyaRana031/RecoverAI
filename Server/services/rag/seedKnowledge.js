require("dotenv").config();

const mongoose = require("mongoose");
const KnowledgeBase = require("../../models/KnowledgeBase");
const { generateEmbedding } = require("./embeddings");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seedKnowledge = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const policies = await KnowledgeBase.find({});
 console.log(`Found ${policies.length} policies`);
    console.log(
  "FIRST EMBEDDING:",
  policies[0].embedding,
  "LENGTH:",
  policies[0].embedding?.length
);

    console.log(`Found ${policies.length} policies`);

    let requestCount = 0;

    for (const policy of policies) {
      // Only skip if an actual embedding exists
      if (Array.isArray(policy.embedding) && policy.embedding.length > 0) {
        console.log(`Skipping: ${policy.title} - embedding already exists`);
        continue;
      }

      // Maximum 3 requests per minute
      if (requestCount > 0) {
        console.log("Waiting 22 seconds...");
        await sleep(22000);
      }

      console.log(`Generating embedding: ${policy.title}`);

      try {
        const embedding = await generateEmbedding(policy.content);

        policy.embedding = embedding;

        await policy.save();

        console.log(
          `Saved embedding for ${policy.title} (${embedding.length} dimensions)`
        );

        requestCount++;
      } catch (error) {
        console.error(
          `Failed to embed ${policy.title}:`,
          error.message
        );
      }
    }

    console.log("Embedding process completed.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Database error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedKnowledge();