require("dotenv").config();
// Change the import here
const { ChatGroq } = require("@langchain/groq"); 
const { OllamaEmbeddings } = require("@langchain/ollama");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const {
  RunnableSequence,
  RunnablePassthrough,
} = require("@langchain/core/runnables");

// 1. Initialize Groq Model
// Make sure GROQ_API_KEY is in your .env file
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile", // Or "mixtral-8x7b-32768"
  temperature: 0.7,
});

// 2. Keep your Embeddings (Must match what you used to ingest the data)
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

// 3. Initialize Vector Store (Chroma)
const vectorStore = new Chroma(embeddings, {
  collectionName: "lernia-collection",
  url: "http://localhost:8000",
});

const formatDocumentsAsString = (documents) => {
  return documents.map((document) => document.pageContent).join("\n\n");
};

const processQuery = async (query) => {
  try {
    const retriever = vectorStore.asRetriever({ k: 5 });

    const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer.

Context: {context}

Question: {question}

Helpful Answer:`;

    const prompt = PromptTemplate.fromTemplate(template);

    // 4. LCEL chain remains the same; LangChain handles the abstraction
    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const answer = await chain.invoke(query);
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