require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  const modelsToTry = ["gemini-2.5-flash"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying model: ${modelName}...`);

      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent("Say hello");
      const text = result.response.text();

      console.log(`✅ SUCCESS with ${modelName}!`);
      console.log("Response:", text);
      return modelName;
    } catch (error) {
      console.log(`❌ Failed: ${error.message.slice(0, 120)}...`);
    }
  }

  console.log("\n❌ None of the models worked!");
}

testGemini();
