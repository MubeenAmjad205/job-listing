
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SessionData } from "@/types";

// Helper: fetch file as Buffer
async function fetchFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch file");
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper: extract text from PDF using pdfreader
function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // Dynamically require pdfreader to avoid build-time issues
    const { PdfReader } = require("pdfreader");
    let extractedText = "";
    new PdfReader().parseBuffer(buffer, (err: any, item: any) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // When done, resolve with the full text
        resolve(extractedText.trim());
      } else if (item.text) {
        extractedText += item.text + "";
      }
    });
  });
}

// Helper: parse JSON from markdown string (if wrapped with ```json ... ```)
function parseJSONFromMarkdown(text: string): any {
  const markdownRegex = /^```json\s*([\s\S]*?)\s*```$/;
  const match = text.match(markdownRegex);
  if (match) {
    return JSON.parse(match[1]);
  }
  return JSON.parse(text);
}

export async function GET(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }>}
) {
  try {
    console.log("Analyzing application...");

    // Verify user session (if needed)
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );
    // (Optional) session check can be added here
    if (!session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const applicationId = parseInt(id, 10);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true,user: true },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }
    if (!application.resume) {
      return NextResponse.json(
        { success: false, error: "Resume file missing" },
        { status: 400 }
      );
    }

    // console.log("Resume URL:", application.resume);
    const fileBuffer = await fetchFile(application.resume);
    let resumeText = await extractTextFromPdf(fileBuffer);
    // resumeText = resumeText.replace(/(\S) /g, '$1');
    console.log("File Size:", resumeText.length);
    console.log("Extracted Text (first 200 chars):", resumeText.slice(0, 200));
    // console.log("Extracted Text (first 200 chars):", resumeText.slice(0, 200).replace(/(\S) /g, '$1'));

    const coverLetter = application.coverLetter;
    const jobDescription = application.job?.description || application.jobTitle;

    const prompt = `
You are an AI recruitment assistant. Below are the details of an application:

Resume Text:
${resumeText}

Cover Letter:
${coverLetter}

Job Description:
${jobDescription}

Based on the above, please provide:
1. A suggestion paragraph with insights on the candidate.
2. A JSON object with the following keys:
   - "matchScore": number (0-100, indicating how well the candidate fits the job)
   - "keySkills": array of strings (important skills identified)
   - "experienceSummary": string (brief summary of relevant experience)

Output the response in the following JSON format:
{
  "suggestion": "Your suggestion here...",
  "stats": {
    "matchScore": 85,
    "keySkills": ["JavaScript", "React", "TypeScript"],
    "experienceSummary": "5 years of relevant experience in front-end development..."
  }
}
    `;

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.3,
      modelName: "gemini-1.5-flash",
    });

    const responseText: any = await model.invoke(prompt);
    let parsedResponse;
    try {
      parsedResponse = parseJSONFromMarkdown(responseText);
      // console.log("Parsed AI response:", parsedResponse);
    } catch (err) {
      parsedResponse = { suggestion: responseText, stats: {} };
    }

    return NextResponse.json({ success: true,job:application.job,user:application.user,application:application, ...parsedResponse }, { status: 200 });
  } catch (error: any) {
    console.error("Error in application analysis:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


