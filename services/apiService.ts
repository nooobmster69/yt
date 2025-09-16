import { GoogleGenAI } from "@google/genai";
import type { AILogEntry } from '../types';

let manualApiKey: string | undefined;
let useManualKeyForImagesOnly = false;

let defaultAi: GoogleGenAI | undefined;

// Initialize the default client from environment variable at module load.
try {
    if (process.env.API_KEY) {
        defaultAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
} catch (error) {
    console.error("Failed to initialize default GoogleGenAI client from environment variable:", error);
}

export const hasDefaultApiKey = () => !!defaultAi;

// Called by the App component to update the manual key configuration.
export const setManualApiKeyConfig = (key: string | undefined, forImagesOnly: boolean) => {
    if (key) {
        // Clean the key to remove non-printable/whitespace characters to prevent header errors.
        manualApiKey = key.replace(/[^\x21-\x7E]/g, "");
    } else {
        manualApiKey = undefined;
    }
    useManualKeyForImagesOnly = forImagesOnly;
};


export const testApiKey = async (key: string): Promise<{valid: boolean, message: string}> => {
    if (!key) return {valid: false, message: 'API Key cannot be empty.'};
    
    const cleanedKey = key.replace(/[^\x21-\x7E]/g, "");

    if (!cleanedKey) {
        return {valid: false, message: 'API Key is empty or contains only invalid characters.'};
    }

    try {
        const testAi = new GoogleGenAI({ apiKey: cleanedKey });
        const shortKey = cleanedKey.length > 4 ? `...${cleanedKey.slice(-4)}` : '...';
        
        let textSuccess = false;
        let imageSuccess = false;
        let textError = '';
        let imageError = '';

        // Test Text Generation
        try {
            const response = await testAi.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
            const responseText = response?.text?.trim();

            if (responseText) {
                 // **STRICTER CHECK**: Look for an error payload within a successful (200 OK) response.
                if (responseText.includes('"error"') && responseText.includes('"message"')) {
                     try {
                        const errorPayload = JSON.parse(responseText);
                        const errorMessage = errorPayload?.error?.message || "Received an error payload from the API.";
                        throw new Error(errorMessage);
                    } catch (jsonError) {
                        throw new Error("Text generation returned an unexpected response format that looks like an error.");
                    }
                }
                
                if (responseText.length > 0) {
                    textSuccess = true;
                } else {
                    throw new Error("Text generation returned an empty response.");
                }
            } else {
                throw new Error("Text generation returned an empty or invalid response structure.");
            }
        } catch (e) {
            textError = e instanceof Error ? e.message : String(e);
        }

        // Test Image Generation
        try {
            const response = await testAi.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: 'a single red dot', config: { numberOfImages: 1 } });
            if (response && response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
                imageSuccess = true;
            } else {
                throw new Error("Image generation returned an empty or invalid response.");
            }
        } catch (e) {
            imageError = e instanceof Error ? e.message : String(e);
        }

        // If either service works, the key is considered valid for at least that service.
        if (textSuccess || imageSuccess) {
            let messageParts = [`API Key ending in ${shortKey} is valid.`];
            if (textSuccess) {
                messageParts.push('✅ Text models (Gemini) are accessible.');
            } else {
                messageParts.push(`❌ Text models (Gemini) failed: ${textError}`);
            }

            if (imageSuccess) {
                messageParts.push('✅ Image models (Imagen) are accessible.');
            } else {
                if (imageError.toLowerCase().includes("quota") && textSuccess) {
                    messageParts.push('⚠️ Image model access might be limited by daily quotas.');
                } else {
                    messageParts.push(`❌ Image models (Imagen) failed: ${imageError}`);
                }
            }
            return { valid: true, message: messageParts.join('\n') };
        } else {
            // Both failed, so the key is invalid.
            const genericInvalidKeyMessage = "The provided API Key appears to be invalid. Please check the key and try again.";
            // Prioritize the Gemini text model error message as it's the primary use case.
            const specificError = textError || imageError;
            
            const isInvalidKeyError = specificError.toLowerCase().includes("api key not valid") 
                                   || specificError.toLowerCase().includes("api key is invalid")
                                   || specificError.toLowerCase().includes("permission denied");

            const errorMessage = isInvalidKeyError 
                ? genericInvalidKeyMessage
                : `API Key test failed. Primary error: ${specificError}`;
                
            return { valid: false, message: errorMessage };
        }

    } catch (error) {
        // This outer catch is for initialization errors.
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { valid: false, message: `An unexpected error occurred during API client initialization: ${errorMessage}` };
    }
}

// Internal helper to get the correct client for a given task.
export function getAiClientForTask(taskType: 'text' | 'image'): GoogleGenAI {
    const manualKeyClient = manualApiKey ? new GoogleGenAI({ apiKey: manualApiKey }) : undefined;

    // Scenario 1: Manual key is provided and should be used for everything.
    if (manualKeyClient && !useManualKeyForImagesOnly) {
        return manualKeyClient;
    }

    // Scenario 2: Task is 'image' and a manual key is available (for images only or for all).
    if (taskType === 'image' && manualKeyClient) {
        return manualKeyClient;
    }

    // Scenario 3: A default key is available and should be used.
    // This is for 'text' tasks when manual key is for images only, or for any task if no manual key is set.
    if (defaultAi) {
        return defaultAi;
    }
    
    // Scenario 4: Fallback to manual key if no default key is present, even if it's set for "images only".
    // This is crucial for users who have no default key but need to run text tasks.
    if (manualKeyClient) {
        return manualKeyClient;
    }

    // If we reach here, no key is available at all.
    throw new Error(`No API key is configured for ${taskType} generation. Please provide a manual key or set up the API_KEY environment variable.`);
}


export const makeApiCall = async (
    featureName: string,
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    apiCall: () => Promise<any>,
    requestPayload: object
): Promise<any> => {
    log({
        feature: featureName,
        status: 'requesting',
        requestData: requestPayload,
        responseData: null,
        errorData: null,
    });
    try {
        const response = await apiCall();
        log({
            feature: featureName,
            status: 'success',
            requestData: requestPayload,
            responseData: response,
            errorData: null,
        });
        return response;
    } catch (error) {
        const errorObject = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error: String(error) };
        log({
            feature: featureName,
            status: 'error',
            requestData: requestPayload,
            responseData: null,
            errorData: errorObject,
        });
        throw error;
    }
};