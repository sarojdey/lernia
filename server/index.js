const express = require("express");
const cors = require("cors");
require("dotenv").config();
const upload = require("./utils/upload");
const { processDocument } = require("./services/ingestion");
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
