const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate structured RFP from natural language
const generateRFP = async (text) => {
  try {
    console.log('🤖 Calling OpenAI API...');
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'));

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Changed from gpt-4 to gpt-3.5-turbo (cheaper and faster)
      messages: [
        {
          role: "system",
          content: `You are an AI that converts natural language procurement requests into structured RFP JSON.
          
Output must be valid JSON with this exact structure:
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

Extract all relevant information from the user's request. Be precise with numbers.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    console.log('✅ OpenAI Response received');
    const rfpData = JSON.parse(completion.choices[0].message.content);
    rfpData.descriptionText = text;
    
    return rfpData;
  } catch (error) {
    console.error('❌ OpenAI Error Details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });
    
    // More specific error messages
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (error.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('OpenAI service error. Please try again.');
    } else {
      throw new Error(`OpenAI Error: ${error.message}`);
    }
  }
};

// Parse vendor proposal email
const parseProposal = async (emailBody, rfpData) => {
  try {
    console.log('🤖 Parsing proposal with OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI that extracts structured proposal information from vendor emails.

Output must be valid JSON with this structure:
{
  "totalPrice": number,
  "currency": "USD",
  "deliveryDays": number,
  "paymentTerms": "string",
  "warrantyMonths": number,
  "notes": "string"
}

Extract pricing, delivery timeline, warranty, and payment terms. If information is missing, use reasonable defaults.`
        },
        {
          role: "user",
          content: `RFP Context: ${JSON.stringify(rfpData)}

Vendor Email Response:
${emailBody}

Extract the proposal details as JSON.`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    console.log('✅ Proposal parsed successfully');
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI Parsing Error:', error.message);
    throw new Error(`Failed to parse proposal: ${error.message}`);
  }
};

// Generate comparison and recommendation
const generateComparison = async (rfpData, proposals) => {
  try {
    console.log('🤖 Generating AI comparison...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a procurement expert AI that evaluates vendor proposals and provides recommendations.

Evaluate each proposal based on:
- Price competitiveness (within budget?)
- Delivery timeline (meets deadline?)
- Warranty coverage
- Payment terms
- Overall value

Output must be valid JSON:
{
  "scores": [
    {
      "vendorId": "string",
      "score": number (0-10),
      "reasoning": "brief explanation"
    }
  ],
  "recommendation": "Overall recommendation paragraph explaining which vendor is best and why"
}`
        },
        {
          role: "user",
          content: `RFP Requirements:
${JSON.stringify(rfpData)}

Vendor Proposals:
${JSON.stringify(proposals)}

Evaluate all proposals and provide scores and recommendation.`
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    console.log('✅ Comparison generated successfully');
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI Comparison Error:', error.message);
    throw new Error(`Failed to generate comparison: ${error.message}`);
  }
};

module.exports = {
  generateRFP,
  parseProposal,
  generateComparison
};
