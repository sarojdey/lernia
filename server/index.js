import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import upload from "./utils/upload.js";
import { processDocument } from "./services/ingestion.js";
import { processQuery } from "./services/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Lernia backend is running" });
});

// Ingestion Endpoint
app.post("/api/ingest", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File received:", req.file.path);
    const result = await processDocument(req.file.path);

    res.json({
      message: "Ingestion successful",
      chunks: result.chunks,
      file: req.file.originalname,
    });
  } catch (error) {
    console.error("Ingestion failed:", error);
    res.status(500).json({ error: "Ingestion failed", details: error.message });
  }
});

// Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const result = await processQuery(query);
    res.json(result);
  } catch (error) {
    console.error("Chat failed:", error);
    res.status(500).json({ error: "Chat failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
