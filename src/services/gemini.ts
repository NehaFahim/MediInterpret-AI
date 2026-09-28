export interface AnalysisResponse {
  documentType: string;
  isSimulated?: boolean;
  simulationNotice?: string;
  patientSummary: {
    en: string;
    ur: string;
  };
  analysis: Array<{
    term: string;
    en: {
      simpleExplanation: string;
      purpose?: string;
    };
    ur: {
      simpleExplanation: string;
      purpose?: string;
    };
    medicineName?: string;
    dosage?: string;
    timing?: string;
  }>;
  keyFindings: Array<{
    en: string;
    ur: string;
  }>;
  urgencyLevel: 'Low' | 'Medium' | 'High';
  disclaimer: {
    en: string;
    ur: string;
  };
  error?: string;
}

/**
 * Analyzes medical document using server-side API (/api/analyze)
 */
export async function analyzeMedicalDocument(
  base64Image: string,
  mimeType: string
): Promise<AnalysisResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64Image,
      mimeType: mimeType || 'image/jpeg',
    }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data.error && !data.documentType) {
      throw new Error(data.error);
    }
    return data as AnalysisResponse;
  }

  // Parse server error if any
  let errorMsg = '';
  try {
    const errorJson = await res.json();
    errorMsg = errorJson?.error || errorJson?.message || '';
  } catch {
    errorMsg = await res.text().catch(() => '');
  }

  if (!errorMsg) {
    errorMsg = `Server request failed with status ${res.status}`;
  }
  throw new Error(errorMsg);
}

/**
 * Provides a high-fidelity sample medical interpretation to preview and test the UI.
 */
export function getSampleAnalysis(): AnalysisResponse {
  return {
    documentType: "Medical Prescription & General Consultation",
    patientSummary: {
      en: "The prescription outlines a standard 5-day treatment regimen for mild seasonal respiratory symptoms and mild pain/fever relief.",
      ur: "یہ نسخہ ہلکے موسمی نزلہ زکام اور ہلکے بخار و درد سے نجات کے لیے 5 دن کے معمول کے علاج کا احاطہ کرتا ہے۔"
    },
    analysis: [
      {
        term: "Panadol (Paracetamol 500mg)",
        medicineName: "Panadol (Paracetamol)",
        dosage: "1 tablet (500mg)",
        timing: "Twice daily after meals",
        en: {
          simpleExplanation: "Common medicine for pain relief and lowering body temperature during fever.",
          purpose: "Relief from fever and body aches."
        },
        ur: {
          simpleExplanation: "یہ عام طور پر بخار کم کرنے اور جسم کے درد سے آرام کے لیے استعمال ہونے والی دوا ہے۔",
          purpose: "بخار اور جسم درد میں سکون کے لیے۔"
        }
      },
      {
        term: "Cetirizine 10mg",
        medicineName: "Cetirizine",
        dosage: "1 tablet (10mg)",
        timing: "Once daily before sleep",
        en: {
          simpleExplanation: "Anti-allergy medication that reduces sneezing, runny nose, and itching.",
          purpose: "Allergy and runny nose control."
        },
        ur: {
          simpleExplanation: "اینٹی الرجی دوا جو چھینکوں، ناک بہنے اور خارش کو کم کرنے میں مدد دیتی ہے۔",
          purpose: "الرجی اور نزلہ زکام کی علامات کو روکنے کے لیے۔"
        }
      },
      {
        term: "Amoxicillin / Clavulanate",
        medicineName: "Amoxicillin 625mg",
        dosage: "1 tablet every 12 hours",
        timing: "For 5 days with water",
        en: {
          simpleExplanation: "Antibiotic prescribed to combat bacterial throat or respiratory tract infections.",
          purpose: "Bacterial infection control."
        },
        ur: {
          simpleExplanation: "یہ اینٹی بائیوٹک ہے جو گلے اور نظام تنفس کے بیکٹیریل انفیکشن کے خاتمے کے لیے دی جاتی ہے۔",
          purpose: "بیکٹیریل انفیکشن کے تدارک کے لیے۔"
        }
      }
    ],
    keyFindings: [
      {
        en: "Routine prescription focused on fever and symptomatic upper respiratory relief.",
        ur: "معمول کا نسخہ جو بنیادی طور پر بخار اور نزلہ زکام کی علامات کو کم کرنے کے لیے ہے۔"
      },
      {
        en: "Prescription duration specified is 5 consecutive days.",
        ur: "دواؤں کے استعمال کی کل مدت 5 مسلسل دن بتائی گئی ہے۔"
      },
      {
        en: "Stay well-hydrated and follow up if symptoms persist beyond 3 to 4 days.",
        ur: "پانی کا زیادہ استعمال کریں اور علامات 3 سے 4 دن میں بہتر نہ ہونے کی صورت میں ڈاکٹر سے رجوع کریں۔"
      }
    ],
    urgencyLevel: "Low",
    disclaimer: {
      en: "This is an automated educational summary, not a medical diagnosis. Always consult a qualified physician or pharmacist before starting or modifying any medication.",
      ur: "یہ ایک خودکار اور معلوماتی خلاصہ ہے، طبی تشخیص نہیں۔ کوئی بھی دوا شروع یا تبدیل کرنے سے پہلے مستند معالج یا فارماسسٹ سے ضرور مشورہ کریں۔"
    }
  };
}
