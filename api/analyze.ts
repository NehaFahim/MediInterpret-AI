import { GoogleGenAI } from "@google/genai";

interface AnalyzeRequest {
  base64Image: string;
  mimeType: string;
}

export default async function handler(req: any, res: any) {
  // Only POST requests are allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { base64Image, mimeType }: AnalyzeRequest = req.body;

    if (!base64Image) {
      return res.status(400).json({
        error: "No medical document image was provided.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");
      return res.status(500).json({
        error: "Gemini API configuration is missing on the server.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are MediInterpret AI, a non-diagnostic medical document
interpretation assistant.

Analyze the uploaded medical document carefully.

The document may be:
- A medical prescription
- A laboratory report
- A medical test report
- Other healthcare-related documentation

Your task is to explain information that is actually visible
or readable in the document in simple language.

IMPORTANT RULES:
1. Do NOT provide a medical diagnosis.
2. Do NOT invent information that is not present in the document.
3. Do NOT change medication names, dosages, frequencies, or values.
4. If something is unclear or unreadable, say so.
5. Explain medical terminology in simple English and Urdu.
6. For medicines, describe their apparent purpose only when it can
   reasonably be identified from the document.
7. Do not recommend starting, stopping, or changing medication.
8. Include a clear disclaimer that this is educational information
   and not a medical diagnosis.

Return ONLY valid JSON in exactly this structure:

{
  "documentType": "string",
  "patientSummary": {
    "en": "string",
    "ur": "string"
  },
  "analysis": [
    {
      "term": "string",
      "en": {
        "simpleExplanation": "string",
        "purpose": "string"
      },
      "ur": {
        "simpleExplanation": "string",
        "purpose": "string"
      },
      "medicineName": "string",
      "dosage": "string",
      "timing": "string"
    }
  ],
  "keyFindings": [
    {
      "en": "string",
      "ur": "string"
    }
  ],
  "urgencyLevel": "Low",
  "disclaimer": {
    "en": "This is an automated educational summary, not a medical diagnosis. Always consult a qualified physician or pharmacist before making medical decisions.",
    "ur": "یہ ایک خودکار اور معلوماتی خلاصہ ہے، طبی تشخیص نہیں۔ طبی فیصلے کرنے سے پہلے مستند ڈاکٹر یا فارماسسٹ سے مشورہ کریں۔"
  }
}

For urgencyLevel use only:
"Low", "Medium", or "High".

Do not wrap the JSON in markdown code fences.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    let analysis;

    try {
      analysis = JSON.parse(text);
    } catch {
      console.error("Invalid JSON returned by Gemini:", text);

      return res.status(500).json({
        error: "Gemini returned an invalid analysis response.",
      });
    }

    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error("Medical document analysis error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Failed to analyze the medical document.",
    });
  }
}