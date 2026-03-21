import { GoogleGenAI, Type } from "@google/genai";
import { AIMode } from "../types";
import { BRAND_IDENTITY, SERVICE_SEGMENTATION } from "../constants/knowledgeBase";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (
  prompt: string,
  mode: AIMode,
  contextData?: string
) => {
  let modelName = 'gemini-3-flash-preview';
  let tools: any[] = [];
  let thinkingConfig: any = undefined;
  let systemInstruction = `Eres el Coordinador de Operación de KlierNav, el cerebro táctico del Operation Center, liderado por ${BRAND_IDENTITY.leader}.
  
  TU MISIÓN:
  - Objetivo: ${BRAND_IDENTITY.focus} (Digital Rescue).
  - Valores: ${BRAND_IDENTITY.values.join(', ')}.
  - Tono: ${BRAND_IDENTITY.message_tone}.

  PLAN DE BATALLA (Segmentación Estratégica):
  1. Rescate Inmediato (Stage 1): ${SERVICE_SEGMENTATION.IMPACT_VALIDATION.services.join(', ')}. Meta: ${SERVICE_SEGMENTATION.IMPACT_VALIDATION.goal}.
  2. Infraestructura Crítica (Stage 2): ${SERVICE_SEGMENTATION.INFRASTRUCTURE.services.join(', ')}. Meta: ${SERVICE_SEGMENTATION.INFRASTRUCTURE.goal}.
  3. Motor Perpetuo (Stage 3): ${SERVICE_SEGMENTATION.PERPETUAL_MOTOR.services.join(', ')}. Meta: ${SERVICE_SEGMENTATION.PERPETUAL_MOTOR.goal}.
  4. Automatización Táctica (Stage 4): ${SERVICE_SEGMENTATION.AUTOMATION_LTV.services.join(', ')}. Meta: ${SERVICE_SEGMENTATION.AUTOMATION_LTV.goal}.
  
  Regla de Oro: Toda respuesta debe respirar urgencia, precisión técnica y enfoque en "Digital Rescue".
  `;

  if (contextData) {
    systemInstruction += `\n\nContexto actual:\n${contextData}`;
  }

  switch (mode) {
    case AIMode.REASONING:
      modelName = 'gemini-3-pro-preview';
      thinkingConfig = { thinkingBudget: 32768 };
      break;
    case AIMode.SEARCH:
      modelName = 'gemini-3-flash-preview';
      tools = [{ googleSearch: {} }];
      break;
    case AIMode.FAST:
    default:
      modelName = 'gemini-3-flash-preview';
      break;
  }

  try {
    // Generate content using the new SDK patterns
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
        thinkingConfig: thinkingConfig,
      }
    });

    // Access .text property directly
    const text = response.text || "No hay respuesta disponible.";
    const sources: Array<{ uri: string; title: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Error al conectar con la inteligencia artificial.", sources: [] };
  }
};

export const generateReplySuggestion = async (conversation: string, leadContext: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugiere una respuesta profesional y breve para esta conversación de KlierNav Innovations.\n\nContexto: ${leadContext}\n\nChat:\n${conversation}`,
      config: {
        systemInstruction: "Eres un Coordinador de Operación experto en rescate digital. Estilo persuasivo, táctico y directo. Máximo 20 palabras."
      }
    });
    return response.text;
  } catch (e) {
    return null;
  }
};

export const analyzeLeadWithAI = async (leadData: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza este lead para KlierNav Operation Center y calcula su Rescue Index (0-100). Considera presupuesto, urgencia de rescate e industria.\n\nLead Data:\n${leadData}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Rescue Index: Probabilidad de éxito del rescate (0-100)." },
            scoreJustification: { type: Type.STRING, description: "Justificación táctica del índice." },
            nextSteps: { type: Type.STRING, description: "Maniobras inmediatas recomendadas." },
            closingStrategy: { type: Type.STRING, description: "Algoritmo de Rescate: Estrategia específica para estabilizar y cerrar." },
            winProbability: { type: Type.INTEGER },
            contactTone: { type: Type.STRING }
          }
        }
      }
    });
    return response.text;
  } catch (e) {
    return null;
  }
}
