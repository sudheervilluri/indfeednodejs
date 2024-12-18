const config = require('./config');
// Make sure to include these imports:
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(config.openAiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//  const prompt = "Write a story about a magic backpack.";

async function generateContent(item) {
    const prompt = `rewrite human written intresting short and crisp in less than 300 charecters from ${item}.`;
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
   // await new Promise(resolve => setTimeout(resolve, 1000)); // 20-second sleep
    return result.response.text();
  }

  module.exports = { generateContent };
