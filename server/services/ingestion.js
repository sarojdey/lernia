const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { Chroma } = require("@langchain/community/vectorstores/chroma");

// Initialize Ollama Embeddings
// Assumes Ollama is running locally on default port 11434 with 'nomic-embed-text' model
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

const processDocument = async (filePath) => {
  try {
    console.log(`Starting processing for file: ${filePath}`);

    // 1. Load the PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from PDF.`);

    // 2. Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitDocuments(docs);
    console.log(`Split document into ${chunks.length} chunks.`);

    // Flatten metadata to avoid nested object errors in ChromaDB
    chunks.forEach((chunk) => {
      const loc = chunk.metadata.loc || {};
      chunk.metadata = {
        source: chunk.metadata.source,
        page: loc.pageNumber || 0,
        // Add other simple fields if needed, but avoid nested objects
      };
    });

    // 3. Store in ChromaDB
    // We create a new collection or add to existing one.
    // Collection name: "lernia-collection"
    await Chroma.fromDocuments(chunks, embeddings, {
      collectionName: "lernia-collection",
      url: "http://localhost:8000", // ChromaDB URL from docker-compose
      collectionMetadata: {
        "hnsw:space": "cosine",
      },
    });

    console.log("Successfully stored chunks in ChromaDB.");
    return { success: true, chunks: chunks.length };
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
};

module.exports = { processDocument };
