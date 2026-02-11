import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq"; 
import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";

dotenv.config();

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

const vectorStore = new Chroma(embeddings, {
  collectionName: "lernia-collection",
  url: "http://localhost:8000",
});

const formatDocumentsAsString = (documents) => {
  return documents.map((document) => document.pageContent).join("\n\n");
};

// --- SESSION MEMORY STORAGE ---
// This stays outside the function to remember previous turns
let chatHistory = [];

export const processQuery = async (query) => {
  try {
    const retriever = vectorStore.asRetriever({ k: 5 });

    // Updated template to include {chat_history}
    const template = `You are a specialist in the data provided. Use the context and conversation history to help the user.

CHAT HISTORY:
{chat_history}

NEW CONTEXT:
{context}

USER QUESTION:
{question}

RULES:
1. PURE TEXT ONLY: No stars (*), hashtags (#), or underscores (_). 
2. STAY ON TOPIC: Only discuss the topic at hand. If the user goes off-topic, politely tell them you can only help with Lernia-related questions.
3. NO HALLUCINATIONS: If the info isn't in the context, say you don't know. 
4. NATURAL TONE: Speak like a human colleague. Use line breaks for paragraphs and dashes (-) for lists.
5. NO BOT INTROS: Do not say "Based on the context."

Response:`;

    const prompt = PromptTemplate.fromTemplate(template);

    const chain = RunnableSequence.from([
      {
        // Get data from vector store
        context: retriever.pipe(formatDocumentsAsString),
        // Feed in the current history array as a string
        chat_history: () => chatHistory.join("\n"),
        // Pass the question through
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const answer = await chain.invoke(query);

    // --- UPDATE HISTORY ---
    // We save the exchange so the NEXT call knows what happened
    chatHistory.push(`User: ${query}`);
    chatHistory.push(`Assistant: ${answer}`);

    // Keep history manageable (last 5 exchanges)
    if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-10);
    }

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