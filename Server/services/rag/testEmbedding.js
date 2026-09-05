require("dotenv").config();

const { generateEmbedding } = require("./embeddings");

const test = async () => {
  try {
    const text =
      "Network-related payment failures can be retried up to two times.";

    const embedding = await generateEmbedding(text);

    console.log("Embedding generated successfully!");
    console.log("Dimensions:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));
  } catch (error) {
    console.error(error);
  }
};

test();