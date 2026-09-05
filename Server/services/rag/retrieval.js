require("dotenv").config();

const KnowledgeBase = require("../../models/KnowledgeBase");
const { generateEmbedding } = require("./embeddings");

const retrievePolicies = async (query, limit = 3) => {
  try {
    console.log("RAG query:", query);

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(
      query,
      "query"
    );

    console.log(
      "Query embedding dimensions:",
      queryEmbedding.length
    );

    // MongoDB Vector Search
    const results = await KnowledgeBase.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          content: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    console.log(
      `RAG retrieved ${results.length} policies`
    );

    return results;
  } catch (error) {
    console.error(
      "Policy retrieval failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  retrievePolicies,
};