import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const generateImageFromImages = async (
  images: { base64ImageData: string; mimeType: string }[],
  prompt: string
): Promise<string | null> => {
  try {
    const imageParts = images.map(image =>
      fileToGenerativePart(image.base64ImageData, image.mimeType)
    );
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // ✅ 단계별 null 체크
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      console.warn("No candidates returned from Gemini API");
      return null;
    }

    const candidate = candidates[0];
    const content = candidate.content;
    const parts = content?.parts;

    if (!parts || parts.length === 0) {
      console.warn("No parts in candidate content");
      return null;
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
        const base64ImageBytes = part.inlineData.data; // inferred as string
        const mimeType = part.inlineData.mimeType; // inferred as string
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
};
