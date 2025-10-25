// app/api/generate-clause/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure API key is loaded
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  // Use a runtime error which Next.js should handle gracefully in dev,
  // but will cause a 500 in prod if not configured.
  throw new Error("GOOGLE_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Define the expected request body structure
interface GenerateClauseRequest {
  userInput: string; // e.g., "clause about no pets allowed"
  templateContext: string; // e.g., "Rental Agreement" or "किराया समझौता"
  targetLanguage: 'hindi' | 'english';
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateClauseRequest = await req.json();
    const { userInput, templateContext, targetLanguage } = body;

    // Basic validation
    if (!userInput || !templateContext || !targetLanguage) {
      return NextResponse.json({ error: 'Missing required fields: userInput, templateContext, targetLanguage' }, { status: 400 });
    }

    console.log(`Generating clause for: ${templateContext} - Request: "${userInput}" in ${targetLanguage}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' }); // Or your preferred model

    // Construct a specific prompt for clause generation
    let promptText = '';
    if (targetLanguage === 'hindi') {
      promptText = `
        आप एक कानूनी सहायक हैं। कृपया "${templateContext}" के संदर्भ में निम्नलिखित आवश्यकता के लिए एक संक्षिप्त, स्पष्ट और कानूनी रूप से उपयुक्त क्लॉज (clause) सरल हिंदी में तैयार करें:

        आवश्यकता: "${userInput}"

        केवल क्लॉज का टेक्स्ट प्रदान करें, बिना किसी अतिरिक्त अभिवादन, स्पष्टीकरण या प्रारूपण के। सुनिश्चित करें कि यह क्लॉज "${templateContext}" प्रकार के दस्तावेज़ के लिए प्रासंगिक हो।
      `;
    } else {
      promptText = `
        You are a legal assistant. Please draft a concise, clear, and legally appropriate clause in simple English for the following requirement, within the context of a "${templateContext}":

        Requirement: "${userInput}"

        Provide only the text of the clause, without any extra greetings, explanations, or formatting. Ensure the clause is relevant for a "${templateContext}" type of document.
      `;
    }

    const result = await model.generateContent(promptText);
    const clauseText = result.response.text();

    if (!clauseText) {
       throw new Error('AI did not generate a response.');
    }

    return NextResponse.json({
      success: true,
      clause: clauseText.trim(), // Trim whitespace
    });

  } catch (error: any) {
    console.error('Error generating clause:', error);

    let errorMessage = 'Failed to generate clause.';
    let statusCode = 500;

    // Handle potential rate limiting errors specifically
     if (error.message && error.message.includes('429')) {
         errorMessage = `API Rate Limit Exceeded. Please try again later. ${error.message}`;
         statusCode = 429;
     } else if (error instanceof Error) {
        errorMessage = error.message;
    }


    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: statusCode }
    );
  }
}

// Optional: Vercel edge runtime configuration (can help with cold starts)
// export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // Ensure fresh execution

