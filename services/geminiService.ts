import { GoogleGenAI, Tool, ToolConfig, RetrievalConfig, LatLng, GenerateContentResponse } from "@google/genai";
import { getSystemInstruction } from '../constants'; // Import the function
import { GeminiContent, GeminiImagePart, GeminiTextPart } from '../types'; // Removed GeminiVideoPart

if (!import.meta.env.VITE_API_KEY) {
    throw new Error("VITE_API_KEY environment variable not set");
}

let ai: GoogleGenAI | null = null; // Initialize lazily

// Function to get or create the GoogleGenAI client
const getGeminiClient = () => {
    // Recreate the client each time to ensure it uses the most up-to-date API key
    // This addresses the race condition mentioned in the guidelines for Veo video generation,
    // and applies generally for dynamic API key selection.
    ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY! });
    return ai;
};


const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

export const fileToGenerativePart = async (file: File): Promise<GeminiImagePart> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

// Removed videoFileToGenerativePart function

export const generateResponse = async (
    history: GeminiContent[],
    newUserText: string,
    imageFiles?: File[] | null
): Promise<string> => {

    const aiClient = getGeminiClient(); // Get the client

    const userParts: (GeminiTextPart | GeminiImagePart)[] = [{ text: newUserText }];

    if (imageFiles && imageFiles.length > 0) {
        const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));
        userParts.push(...imageParts);
    }
    
    const contents: GeminiContent[] = [
        ...history,
        { role: 'user', parts: userParts }
    ];

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await aiClient.models.generateContent({
                model: "gemini-2.5-flash", 
                contents: contents,
                config: {
                    systemInstruction: getSystemInstruction() // Call the function here
                }
            });
            return response.text; // Success
        } catch (error: any) {
            const errorMessage = error.toString();
            // Check for retriable errors: 503 (Unavailable/Overloaded), 429 (Resource Exhausted)
            const isRetriableError = (
                error.code === 503 ||
                errorMessage.includes("503") ||
                errorMessage.includes("UNAVAILABLE") ||
                errorMessage.includes("overloaded") ||
                errorMessage.includes("RESOURCE_EXHAUSTED") ||
                errorMessage.includes("429")
            );

            if (isRetriableError && i < MAX_RETRIES - 1) {
                const delay = INITIAL_DELAY * Math.pow(2, i);
                console.log(`Retriable API error (${error.code || 'unknown'}): ${errorMessage}. Retrying in ${delay}ms... (Attempt ${i + 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Go to next iteration to retry
            }
            
            // For other errors or max retries reached, handle and return error message
            console.error("Error generating response from Gemini:", error);
            if (isRetriableError) { // If it was a retriable error but retries failed
                return "API_ERROR: Le service est actuellement surchargé ou temporairement indisponible. Veuillez patienter quelques instants avant de réessayer.";
            }
            return "API_ERROR: Désolé, une erreur de communication inattendue s'est produite. Veuillez réessayer.";
        }
    }
    
    // This should not be reached, but as a fallback.
    return "API_ERROR: Échec de la communication après plusieurs tentatives.";
};

/**
 * Generates an image based on a prompt and aspect ratio.
 */
/*
export const generateImage = async (prompt: string, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'): Promise<string> => {
    const aiClient = getGeminiClient();
    try {
        const response = await aiClient.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error: any) {
        console.error("Error generating image from Imagen:", error);
        throw new Error(`IMAGE_GENERATION_ERROR: ${error.message || "Échec de la génération d'image."}`);
    }
};
*/

/**
 * Removed analyzeVideo function
 */
/*
export const analyzeVideo = async (videoFile: File, question: string): Promise<string> => {
    const aiClient = getGeminiClient();
    const videoPart = await videoFileToGenerativePart(videoFile);

    try {
        const response: GenerateContentResponse = await aiClient.models.generateContent({
            model: 'gemini-2.5-pro', // Using gemini-2.5-pro for video understanding
            contents: [{ parts: [videoPart, { text: question }] }],
        });
        return response.text;
    } catch (error: any) {
        console.error("Error analyzing video from Gemini Pro:", error);
        throw new Error(`VIDEO_ANALYSIS_ERROR: ${error.message || "Échec de l'analyse vidéo."}`);
    }
};
*/

/**
 * Searches for dermatologists using Google Maps grounding.
 * @param country The country to search in (optional if using userLatLng).
 * @param city The city to search in (optional if using userLatLng).
 * @param userLatLng Optional user's current latitude and longitude for more localized results.
 * @returns The GenerateContentResponse from the Gemini API, containing groundingMetadata.
 */
export const searchDermatologistsWithMaps = async (
    country: string,
    city: string,
    userLatLng?: LatLng | null
): Promise<GenerateContentResponse> => {
    const aiClient = getGeminiClient();

    const tools: Tool[] = [{ googleMaps: {} }];
    const toolConfig: ToolConfig = {};

    if (userLatLng) {
        toolConfig.retrievalConfig = {
            latLng: userLatLng
        };
    }

    // Dynamic prompt generation based on whether city/country are provided or if it's a geolocation search
    let prompt = "";
    if (city && country) {
        prompt = `Trouvez des dermatologues à ${city}, ${country}.`;
    } else if (userLatLng) {
        prompt = `Trouvez les dermatologues les plus proches de ma position actuelle (rayon 10-15km).`;
    } else {
         // Fallback if neither location info is present properly
         prompt = "Trouvez des dermatologues.";
    }

    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                tools: tools,
                toolConfig: toolConfig,
                // DO NOT set responseMimeType or responseSchema as per guidelines for googleMaps tool
            },
        });
        return response;
    } catch (error: any) {
        console.error("Error searching dermatologists with Maps Grounding:", error);
        throw new Error(`MAPS_API_ERROR: ${error.message || "Failed to search for dermatologists."}`);
    }
};