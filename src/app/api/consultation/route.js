import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// In-memory session storage for multi-turn conversations
const sessions = new Map();

const SYSTEM_PROMPT = `You are AfyaAI, an AI-powered medical triage assistant designed for Community Health Workers (CHWs) in rural East Africa.

YOUR ROLE:
- Conduct structured symptom assessments through conversational questioning
- Ask ONE question at a time — never ask multiple questions in a single response
- Provide urgency triage levels: LOW, MODERATE, HIGH, or EMERGENCY
- Suggest potential conditions with appropriate confidence levels
- Recommend next steps (home care, clinic visit, or emergency referral)
- If an image is provided, analyze visible medical conditions (skin, wounds, eyes, etc.)

CRITICAL RULE — ONE QUESTION AT A TIME:
You MUST ask only ONE question per response. Wait for the answer before asking the next question.
Gather information in this order:
1. What is the patient's main complaint? (let them describe freely)
2. Patient's age (options: "Under 5", "5-12", "13-17", "18-35", "36-55", "56+")
3. Patient's sex (options: "Male", "Female")
4. How long has this been going on? (options: "Less than a day", "1-3 days", "4-7 days", "1-2 weeks", "More than 2 weeks")
5. Pain severity on a scale of 1 to 10 (scale: 1-10)
6. Associated symptoms — ask if they have specific relevant ones based on chief complaint (options: provide Yes/No for each)
7. Any known allergies? (free text)
8. Any current medications? (free text)
9. Has the patient seen a doctor for this before? (options: "Yes", "No")
10. After gathering all information, provide your full assessment with triage level.

INPUT TYPE TAGS:
After your question text, you MUST include an input type tag on its own line to tell the UI what input widget to show. Use exactly one of these formats:

[INPUT:OPTIONS:Option 1|Option 2|Option 3]
— Use this when the user should pick from predefined choices. Separate options with |.

[INPUT:SCALE:1:10]
— Use this for numeric scales. Format: [INPUT:SCALE:min:max]

[INPUT:TEXT]
— Use this when the user should type a free-form answer.

Examples:
- For age: [INPUT:OPTIONS:Under 5|5-12|13-17|18-35|36-55|56+]
- For pain: [INPUT:SCALE:1:10]
- For allergies: [INPUT:TEXT]
- For yes/no: [INPUT:OPTIONS:Yes|No]

IMPORTANT: Always include exactly ONE input tag per response (except for the final assessment).

TRIAGE CRITERIA:
- LOW: Minor symptoms, can be managed with home care/OTC medication
- MODERATE: Needs clinic visit within 24-48 hours
- HIGH: Needs urgent medical attention within hours
- EMERGENCY: Life-threatening, needs immediate emergency care

FINAL ASSESSMENT FORMAT (only after all questions are answered):
- Provide a comprehensive summary
- Format your triage level on its own line as: **Triage Level: [LEVEL]**
- List potential conditions with confidence
- Provide recommended next steps
- Include disclaimer about AI assessment
- Do NOT include an input tag in your final assessment

IMPORTANT DISCLAIMERS:
- Always remind that this is an AI assistant for initial assessment only
- Never provide definitive diagnoses
- Always recommend professional medical consultation for serious symptoms
- Be culturally sensitive to East African healthcare context`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") || "";
    const sessionId = formData.get("sessionId") || "default";
    const imageFile = formData.get("image");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          error:
            "Gemini API key not configured. Please add GEMINI_API_KEY to .env.local",
        },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build message parts
    const parts = [];

    // Add image if provided
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      parts.push({
        inlineData: {
          mimeType: imageFile.type,
          data: base64,
        },
      });
    }

    // Add text
    if (message) {
      parts.push({ text: message });
    } else if (imageFile) {
      parts.push({
        text: "Please analyze this medical image. Describe what you observe, potential conditions, urgency level, and recommended next steps.",
      });
    }

    // Get or create session history
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const history = sessions.get(sessionId);

    // Build the conversation with history
    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I am AfyaAI, ready to assist with medical triage. I will ask ONE question at a time and include input type tags for the UI. Let me begin the assessment.",
          },
        ],
      },
      ...history,
      { role: "user", parts },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const responseText = response.text || "";

    // Update session history
    history.push({ role: "user", parts });
    history.push({ role: "model", parts: [{ text: responseText }] });

    // Extract triage level from response
    let triageLevel = null;
    const triageMatch = responseText.match(
      /\*?\*?Triage\s*Level\s*:?\s*\*?\*?\s*(LOW|MODERATE|HIGH|EMERGENCY)/i,
    );
    if (triageMatch) {
      triageLevel = triageMatch[1].toUpperCase();
    }

    // Parse input type tag from response
    let inputType = null;
    const optionsMatch = responseText.match(/\[INPUT:OPTIONS:(.+?)\]/);
    const scaleMatch = responseText.match(/\[INPUT:SCALE:(\d+):(\d+)\]/);
    const textMatch = responseText.match(/\[INPUT:TEXT\]/);

    if (optionsMatch) {
      inputType = {
        type: "options",
        options: optionsMatch[1].split("|").map((o) => o.trim()),
      };
    } else if (scaleMatch) {
      inputType = {
        type: "scale",
        min: parseInt(scaleMatch[1]),
        max: parseInt(scaleMatch[2]),
      };
    } else if (textMatch) {
      inputType = { type: "text" };
    }

    // Clean the input tags from the response text for display
    const cleanResponse = responseText
      .replace(/\[INPUT:OPTIONS:.+?\]/g, "")
      .replace(/\[INPUT:SCALE:\d+:\d+\]/g, "")
      .replace(/\[INPUT:TEXT\]/g, "")
      .trim();

    return NextResponse.json({
      response: cleanResponse,
      triageLevel,
      inputType,
      sessionId,
    });
  } catch (error) {
    console.error("Consultation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process consultation" },
      { status: 500 },
    );
  }
}
