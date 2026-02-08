require("dotenv").config({ path: "../.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const modelsToCheck = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.0-pro",
  "gemini-pro",
];

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

  for (const modelName of modelsToCheck) {
    try {
      console.log(`Checking ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      console.log(`SUCCESS with ${modelName}`);
      return;
    } catch (error) {
      console.log(`Error with ${modelName}:`, error.message);
    }
  }
  console.log("All models failed.");
}

listModels();
