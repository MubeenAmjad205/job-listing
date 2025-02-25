import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SessionData } from "@/types";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Adjusted params type
) {
  try {
    console.log("Analyzing application...");

    // Await the params promise
    const { id } = await context.params;
    const applicationId = parseInt(id, 10);

    // Verify user session
    const session = await getIronSession<SessionData>(
      req,
      NextResponse.next(),
      sessionOptions
    );

    if (!session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the application record from the database
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

    // Extract resume text
    // const resumeText = await extractTextFromDocument(application.resume);

    // Get cover letter and job description
    const coverLetter = application.coverLetter;
    const jobDescription =
      application.job?.description || application.jobTitle;

    // Prompt for AI model
    const prompt = `
You are an AI recruitment assistant. Below are the details of an application:

Resume Text:

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

    // Initialize the AI model
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.3,
      modelName: "gemini-1.5-flash",
    });

    // Invoke the AI model
    const responseText: any = await model.invoke(prompt);

    // Try to parse response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
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
