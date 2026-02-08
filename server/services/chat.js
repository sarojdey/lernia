require("dotenv").config();
const { ChatOllama } = require("@langchain/ollama");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const {
  RunnableSequence,
  RunnablePassthrough,
} = require("@langchain/core/runnables");

// Initialize Ollama Chat Model
const model = new ChatOllama({
  model: "tinyllama",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
});

// Initialize Embeddings (Must match ingestion)
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

// Initialize Vector Store
const vectorStore = new Chroma(embeddings, {
  collectionName: "lernia-collection",
  url: "http://localhost:8000",
});

const formatDocumentsAsString = (documents) => {
  return documents.map((document) => document.pageContent).join("\n\n");
};

const processQuery = async (query) => {
  try {
    // 1. Create a retriever
    const retriever = vectorStore.asRetriever({
      k: 5, // Retrieve top 5 chunks
    });

    // 2. Create the prompt template
    const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer.

Context: {context}

Question: {question}

Helpful Answer:`;

    const prompt = PromptTemplate.fromTemplate(template);

    // 3. Create the LCEL chain
    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    // 4. Run the chain
    const answer = await chain.invoke(query);

    // To get sources, we need to run retriever separately or use a more complex chain
    // For now, let's just run retriever separately to return sources
    const retrievedDocs = await retriever.invoke(query);

    return {
      answer: answer,
      sources: retrievedDocs.map((doc) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    };
  } catch (error) {
    console.error("Error processing query:", error);
    throw error;
  }
};

module.exports = { processQuery };
