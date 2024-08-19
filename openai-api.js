const config = require('./config');
// Make sure to include these imports:
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(config.openAiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//  const prompt = "Write a story about a magic backpack.";

async function generateContent(item) {
    const prompt = `rewrite trending tweet short and crisp in less than 300 charecters with trending tags from ${item}.`;
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
  }

  module.exports = { generateContent };
