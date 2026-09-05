const path = require("path");

// Load .env specifically from the Server folder
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const generateEmbedding = async (text, inputType = "document") => {
  // Read API key from environment
  const rawKey = process.env.VOYAGE_API_KEY;

  // Remove accidental spaces or quotes
  const apiKey = rawKey
    ? rawKey.trim().replace(/^["']|["']$/g, "")
    : null;

  // Check API key
  if (!apiKey) {
    throw new Error(
      "VOYAGE_API_KEY is missing or undefined. Check that Server/.env contains VOYAGE_API_KEY."
    );
  }

  // Safe debugging information
  console.log(
    `Voyage API key loaded: YES (${apiKey.length} characters)`
  );

  console.log(
    `Generating ${inputType} embedding...`
  );

  try {
    // Call Voyage AI Embeddings API
    const response = await fetch(
      "https://api.voyageai.com/v1/embeddings",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          input: [text],
          model: "voyage-4-lite",
          input_type: inputType,
        }),
      }
    );

    // Read response
    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      throw new Error(
        `Embedding API error ${response.status}: ${JSON.stringify(data)}`
      );
    }

    // Validate response
    if (!data.data?.[0]?.embedding) {
      throw new Error(
        "Invalid embedding response structure from Voyage AI"
      );
    }

    const embedding = data.data[0].embedding;

    console.log(
      `Embedding generated successfully. Dimensions: ${embedding.length}`
    );

    return embedding;
  } catch (error) {
    console.error(
      "Embedding generation failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  generateEmbedding,
};