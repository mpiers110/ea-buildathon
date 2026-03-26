import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const IMAGE_ANALYSIS_PROMPT = `You are AfyaAI, a medical image analysis assistant for Community Health Workers in rural East Africa.

Analyze the provided medical image and provide a structured assessment:

## Observations
- Describe what you see in the image in detail
- Note any visible abnormalities, colors, textures, patterns

## Possible Conditions
- List potential conditions that match the visual presentation
- Provide confidence level for each (High/Medium/Low confidence)

## Urgency Assessment
- Provide a triage level: LOW, MODERATE, HIGH, or EMERGENCY
- Format as: **Triage Level: [LEVEL]**

## Recommended Actions
- Immediate care steps the CHW can take
- Whether the patient needs a clinic referral
- Any red flags to watch for

## Important Notes
- Include relevant differential diagnoses
- Note any limitations in the assessment

⚠️ DISCLAIMER: This is an AI-powered initial assessment tool. It does not replace professional medical diagnosis. Always refer patients to qualified healthcare providers for definitive evaluation and treatment.`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

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

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: imageFile.type,
                data: base64,
              },
            },
            { text: IMAGE_ANALYSIS_PROMPT },
          ],
        },
      ],
    });

    const analysisText = response.text || "";

    // Extract urgency level
    let urgency = null;
    const urgencyMatch = analysisText.match(
      /\*?\*?Triage\s*Level\s*:?\s*\*?\*?\s*(LOW|MODERATE|HIGH|EMERGENCY)/i,
    );
    if (urgencyMatch) {
      urgency = urgencyMatch[1].toUpperCase();
    }

    return NextResponse.json({
      analysis: analysisText,
      urgency,
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 },
    );
  }
}
