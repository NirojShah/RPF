const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate structured RFP from natural language
const generateRFP = async (text) => {
  try {
    console.log('🤖 Calling Gemini API...');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ✅ Fixed

    const prompt = `You are an AI that converts natural language procurement requests into structured RFP JSON.

User Request: "${text}"

Output ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "title": "Brief descriptive title",
  "budget": number,
  "deliveryDeadline": number (in days),
  "paymentTerms": "string",
  "lineItems": [
    {
      "itemType": "string",
      "quantity": number,
      "specs": "string"
    }
  ]
}

Extract all relevant information from the user's request. Be precise with numbers.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();

    console.log('✅ Gemini Response received');

    // Clean up response (remove markdown code blocks if present)
    jsonText = jsonText.replace(/``````\n?/g, '').trim();

    const rfpData = JSON.parse(jsonText);
    rfpData.descriptionText = text;

    return rfpData;
  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
};

// Parse vendor proposal email
// Parse vendor proposal email
const parseProposal = async (emailBody, rfpData) => {
  try {
    console.log('🤖 Parsing proposal with Gemini...');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI that extracts structured proposal information from vendor emails.

RFP Context: ${JSON.stringify(rfpData)}

Vendor Email Response:
${emailBody}

Output ONLY valid JSON with this structure (no markdown, no code blocks, no backticks):
{
  "totalPrice": number,
  "currency": "USD",
  "deliveryDays": number,
  "paymentTerms": "string",
  "warrantyMonths": number,
  "notes": "string"
}

IMPORTANT: Return ONLY the JSON object. Do not wrap it in markdown code blocks.

Extract pricing, delivery timeline, warranty, and payment terms. If information is missing, use reasonable defaults.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    console.log('Raw Gemini response:', responseText);

    // METHOD 1: Try to extract JSON object with regex
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const jsonText = jsonMatch[0];
    console.log('Extracted JSON:', jsonText);

    const proposalData = JSON.parse(jsonText);

    console.log('✅ Proposal parsed successfully');
    return proposalData;

  } catch (error) {
    console.error('❌ Gemini Parsing Error:', error.message);
    console.error('Failed response text:', responseText);
    throw new Error(`Failed to parse proposal: ${error.message}`);
  }
};




// Generate comparison and recommendation
const generateComparison = async (rfpData, proposals) => {
  try {
    console.log('🤖 Generating AI comparison with Gemini...');

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ✅ Fixed

    const prompt = `You are a procurement expert AI that evaluates vendor proposals and provides recommendations.

RFP Requirements:
${JSON.stringify(rfpData)}

Vendor Proposals:
${JSON.stringify(proposals)}

Evaluate each proposal based on:
- Price competitiveness (within budget?)
- Delivery timeline (meets deadline?)
- Warranty coverage
- Payment terms
- Overall value

Output ONLY valid JSON (no markdown, no extra text):
{
  "scores": [
    {
      "vendorId": "string (must match proposal vendorId)",
      "score": number (0-10),
      "reasoning": "brief explanation"
    }
  ],
  "recommendation": "Overall recommendation paragraph explaining which vendor is best and why"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();

    // Clean up response
    jsonText = jsonText.replace(/``````\n?/g, '').trim();

    console.log('✅ Comparison generated successfully');
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('❌ Gemini Comparison Error:', error.message);
    throw new Error(`Failed to generate comparison: ${error.message}`);
  }
};

module.exports = {
  generateRFP,
  parseProposal,
  generateComparison
};
