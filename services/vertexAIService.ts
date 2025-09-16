import { PredictionServiceClient } from '@google-cloud/aiplatform';
import type { AILogEntry } from '../types';

let manualApiKey: string | undefined;
let useManualKeyForImagesOnly = false;

let defaultClient: PredictionServiceClient | undefined;

// Initialize the default client from environment variables at module load.
try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_CLOUD_PROJECT) {
        defaultClient = new PredictionServiceClient({
            apiEndpoint: `${process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'}-aiplatform.googleapis.com`,
        });
    }
} catch (error) {
    console.error("Failed to initialize default Vertex AI client from environment variables:", error);
}

export const hasDefaultApiKey = () => !!defaultClient;

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
        // For Vertex AI, we need to test with a simple text generation request
        const testClient = new PredictionServiceClient({
            apiEndpoint: `${process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'}-aiplatform.googleapis.com`,
        });
        
        const shortKey = cleanedKey.length > 4 ? `...${cleanedKey.slice(-4)}` : '...';
        
        let textSuccess = false;
        let textError = '';

        // Test Text Generation with Gemini model
        try {
            const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
            const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
            const model = `projects/${project}/locations/${location}/publishers/google/models/gemini-1.5-flash`;

            const request = {
                endpoint: model,
                instances: [{
                    content: "test"
                }],
                parameters: {
                    temperature: 0.1,
                    maxOutputTokens: 10
                }
            };

            const [response] = await testClient.predict(request);
            
            if (response && response.predictions && response.predictions.length > 0) {
                textSuccess = true;
            } else {
                throw new Error("Text generation returned an empty or invalid response.");
            }
        } catch (e) {
            textError = e instanceof Error ? e.message : String(e);
        }

        if (textSuccess) {
            return { 
                valid: true, 
                message: `Vertex AI API Key ending in ${shortKey} is valid.\n✅ Text models (Gemini) are accessible via Vertex AI.` 
            };
        } else {
            const genericInvalidKeyMessage = "The provided API Key appears to be invalid. Please check your Google Cloud credentials and try again.";
            const isInvalidKeyError = textError.toLowerCase().includes("permission denied") 
                                   || textError.toLowerCase().includes("authentication")
                                   || textError.toLowerCase().includes("credentials");

            const errorMessage = isInvalidKeyError 
                ? genericInvalidKeyMessage
                : `Vertex AI API test failed. Error: ${textError}`;
                
            return { valid: false, message: errorMessage };
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { valid: false, message: `An unexpected error occurred during Vertex AI client initialization: ${errorMessage}` };
    }
}

// Internal helper to get the correct client for a given task.
export function getAiClientForTask(taskType: 'text' | 'image'): PredictionServiceClient {
    const manualKeyClient = manualApiKey ? new PredictionServiceClient({
        apiEndpoint: `${process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'}-aiplatform.googleapis.com`,
    }) : undefined;

    // Scenario 1: Manual key is provided and should be used for everything.
    if (manualKeyClient && !useManualKeyForImagesOnly) {
        return manualKeyClient;
    }

    // Scenario 2: Task is 'image' and a manual key is available (for images only or for all).
    if (taskType === 'image' && manualKeyClient) {
        return manualKeyClient;
    }

    // Scenario 3: A default key is available and should be used.
    if (defaultClient) {
        return defaultClient;
    }
    
    // Scenario 4: Fallback to manual key if no default key is present.
    if (manualKeyClient) {
        return manualKeyClient;
    }

    // If we reach here, no key is available at all.
    throw new Error(`No API key is configured for ${taskType} generation. Please provide a manual key or set up the GOOGLE_APPLICATION_CREDENTIALS environment variable.`);
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
