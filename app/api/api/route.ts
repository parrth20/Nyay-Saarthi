import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

// Ensure API key is loaded (consider adding checks if it's undefined)
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  let uploadedGeminiFileName: string | null = null; // Renamed to avoid confusion with original filename

  try {
    const contentType = req.headers.get('content-type') || '';

    // --- Handling JSON request (likely for already processed/named documents) ---
    if (contentType.includes('application/json')) {
      const { docName } = await req.json();

      if (!docName) {
        return NextResponse.json({ error: 'No document name provided' }, { status: 400 });
      }

      console.log('Fetching summary based on document name:', docName);

      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' }); // Or your preferred model

      // **Updated Prompt for JSON request**
      const result = await model.generateContent([
        { text: `कृपया "${docName}" नामक दस्तावेज़ को सरल हिंदी में एक स्पष्ट पैराग्राफ में सारांशित करें, जिसमें इसके मुख्य विचारों और उद्देश्य को शामिल किया गया हो। केवल सरल हिंदी में उत्तर दें।` },
        // Simple English fallback: Please summarize the document titled "${docName}" in one clear paragraph in simple Hindi, covering its main ideas and purpose. Respond only in simple Hindi.
      ]);

      const summary = result.response.text();

      return NextResponse.json({
        success: true,
        summary,
        fileName: docName, // Return the original name requested
      });
    }
    // --- Handling File Upload (multipart/form-data) ---
    else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file'); // Match the key used in the frontend upload ('file' typically)

      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'No file provided or file data is invalid' }, { status: 400 });
      }

      // Allow multiple types if needed, adjust check accordingly
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
       if (!allowedTypes.includes(file.type)) {
         console.warn(`Unsupported file type received: ${file.type}`);
         // Allow processing attempt but be aware Gemini might not support it well
         // Or return error: return NextResponse.json({ error: 'Unsupported file type. Only PDF, DOCX, TXT allowed' }, { status: 400 });
       }


      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
      await fs.writeFile(tempFilePath, buffer);

      console.log(`Uploading ${file.type} to Gemini File API...`);

      // Upload file to Gemini File API
      const uploadResult = await fileManager.uploadFile(tempFilePath, {
        mimeType: file.type, // Use the actual file type
        displayName: file.name,
      });
      uploadedGeminiFileName = uploadResult.file.name; // Store the Gemini file name (looks like 'files/...')

      console.log(`File uploaded to Gemini: ${uploadedGeminiFileName}, URI: ${uploadResult.file.uri}`);


      // --- Wait for File Processing ---
      let fileState = await fileManager.getFile(uploadedGeminiFileName);
      console.log(`Initial file state: ${fileState.state}`);
      const maxWaitTime = 120000; // Max 2 minutes wait
      const startTime = Date.now();
      while (fileState.state === 'PROCESSING' && Date.now() - startTime < maxWaitTime) {
        console.log('File is processing, waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer between checks
        fileState = await fileManager.getFile(uploadedGeminiFileName);
        console.log(`Current file state: ${fileState.state}`);
      }

      if (fileState.state === 'PROCESSING') {
         throw new Error('File processing timed out after 2 minutes.');
      }
      if (fileState.state === 'FAILED') {
        console.error('Gemini file processing failed:', fileState);
        throw new Error('Google AI failed to process the file.');
      }
       if (fileState.state !== 'ACTIVE') {
         throw new Error(`Unexpected file state: ${fileState.state}`);
       }
       // --- End Wait for File Processing ---

      console.log('Generating summary from processed file...');

      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' }); // Or "gemini-1.5-flash-latest"

      // **Updated and More Explicit Hindi Prompt for File Upload**
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri,
          },
        },
        {
          text: `
          कृपया अपलोड किए गए दस्तावेज़ का सावधानीपूर्वक विश्लेषण करें।
          फिर, एक **सरल हिंदी** में लिखा हुआ, सुसंगत पैराग्राफ तैयार करें जो पूरी सामग्री को स्पष्ट और संक्षिप्त रूप से सारांशित करता हो।
          दस्तावेज़ के मुख्य विचारों, प्रमुख अंतर्दृष्टियों और समग्र उद्देश्य पर ध्यान केंद्रित करें।
          शीर्षक (Headings), बुलेट पॉइंट्स या सूचियों से बचें - इसे केवल एक पैराग्राफ के रूप में लिखें।
          सुनिश्चित करें कि प्रतिक्रिया **केवल और केवल सरल हिंदी** में हो। अंग्रेजी शब्दों का प्रयोग न करें जब तक कि कोई उचित हिंदी विकल्प न हो (जैसे किसी नाम या विशिष्ट शब्द)।

          ---
          Analyze the uploaded document carefully. Then, produce a single, well-written paragraph **in simple Hindi** that clearly and concisely summarizes the entire content. Focus on the main ideas, key insights, and overall purpose. Avoid headings, bullet points, or lists — write it as one cohesive paragraph. Ensure the response is **only and exclusively in simple Hindi**. Do not use English words unless there is no reasonable Hindi alternative (like a name or specific term).
          `,
        },
      ]);

      const summary = result.response.text();

      return NextResponse.json({
        success: true,
        summary, // This should now be in Hindi if the model follows instructions
        fileName: file.name, // Return the original uploaded filename
      });
    }
    // --- Unsupported Content Type ---
    else {
      return NextResponse.json(
        { error: `Unsupported content type: ${contentType}` },
        { status: 415 }
      );
    }
  } catch (error: any) { // Catch specific Google AI errors if possible
    console.error('Error processing request:', error);

    // Provide more specific error messages
    let errorMessage = 'Failed to process the request.';
    let statusCode = 500;

    if (error.message && error.message.includes('API key not valid')) {
        errorMessage = 'Invalid Google API Key configuration.';
        statusCode = 500; // Internal server error due to config
    } else if (error.message && error.message.includes('429')) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
        statusCode = 429;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }


    return NextResponse.json(
      // Return a structured error
      { error: errorMessage, details: error.message },
      { status: statusCode }
    );
  } finally {
    // --- Cleanup Temporary Files ---
    try {
      if (tempFilePath) {
         console.log('Cleaning up temporary file:', tempFilePath);
         await fs.unlink(tempFilePath);
      }
      // Attempt to delete from Gemini File API ONLY IF it was successfully uploaded
      if (uploadedGeminiFileName) {
         console.log('Deleting file from Gemini File API:', uploadedGeminiFileName);
         // Add a try-catch specifically for the delete operation
         try {
            await fileManager.deleteFile(uploadedGeminiFileName);
            console.log('Successfully deleted file from Gemini File API.');
         } catch (deleteError) {
             console.error('Error deleting file from Gemini File API (might already be deleted or failed upload):', deleteError);
             // Don't throw an error here, just log it, as the main operation might have succeeded or failed earlier.
         }
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
      // Log cleanup errors but don't let them override the main response
    }
  }
}

// Keep Vercel settings
export const maxDuration = 60; // Allow up to 60 seconds for processing
export const dynamic = 'force-dynamic'; // Ensure fresh execution
