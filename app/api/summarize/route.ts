import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  let uploadedFileName: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('pdf');

   
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

   
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `${Date.now()}-${file.name}`);
    await fs.writeFile(tempFilePath, buffer);

    console.log('Uploading to Gemini...');

   
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: 'application/pdf',
      displayName: file.name,
    });

    uploadedFileName = uploadResult.file.name;
    console.log('Upload successful:', uploadedFileName);

    let fileState = await fileManager.getFile(uploadedFileName);
    while (fileState.state === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      fileState = await fileManager.getFile(uploadedFileName);
    }

    if (fileState.state === 'FAILED') {
      throw new Error('File processing failed');
    }

    console.log('Generating summary...');

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
      { 
        text: `
You are an expert text analyst and summarization specialist. 
Read and analyze the uploaded document carefully, then produce a single, well-written paragraph 
that clearly and concisely summarizes the entire content. 
Focus on the main ideas, key insights, and overall purpose of the document. 
Avoid headings, bullet points, or lists — write it as one cohesive paragraph 
in a neutral, professional tone with no repetition.
    `
      },
    ]);

    const summary = result.response.text();

    return NextResponse.json({ 
      success: true, 
      summary,
      fileName: file.name,
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to process PDF: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  } finally {
    
    try {
      if (tempFilePath) {
        await fs.unlink(tempFilePath);
        console.log('Temp file deleted');
      }
      if (uploadedFileName) {
        await fileManager.deleteFile(uploadedFileName);
        console.log('Gemini file deleted');
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
