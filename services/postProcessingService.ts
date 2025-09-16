import { Type } from "@google/genai";
import { makeApiCall, getAiClientForTask } from './apiService';
import { NARRATIVE_IMAGE_PROMPT_GUIDELINES, MRBEAST_THUMBNAIL_PROMPT_GUIDELINES, CRITICAL_OUTPUT_RULES } from './promptService';
import type { AILogEntry, CanvasElement, Chapter, EditingSuggestion, ImageAspectRatio, ImageGenerationModel, LanguageCode, SSMLStyle, TitledPrompt, ThumbnailSuggestion } from '../types';
import { supportedLanguages } from '../types';
import { styles } from './imageStyles';

export const generateInitialVisuals = async (
    topic: string,
    summary: string,
    fullScript: string,
    characters: string | undefined,
    numberOfInitialPrompts: number,
    thumbnailText: string | undefined,
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<{ thumbnailPrompt: TitledPrompt, initialImagePrompts: TitledPrompt[] }> => {
    const langName = supportedLanguages[language]?.name || 'English';
    const scriptForContext = fullScript.length > 8000 
        ? `${fullScript.substring(0, 4000)}... [SCRIPT TRUNCATED FOR BREVITY] ...${fullScript.slice(-4000)}`
        : fullScript;

    const prompt = `
You are a YouTube content strategist and art director. Based on the provided video topic, summary, and the full script, generate the key visual metadata.

--- VIDEO DETAILS ---
Topic: "${topic}"
Summary: "${summary}"
Characters: ${characters || 'N/A'}

--- FULL SCRIPT (for context) ---
${scriptForContext}
--- END SCRIPT ---

Your task is to generate a JSON object with two properties:
1.  **thumbnailPrompt**: A detailed, structured prompt for a VIRAL, MrBeast-style thumbnail. ${thumbnailText ? `The **Text:** section MUST incorporate the text: "${thumbnailText}"` : ''}
2.  **initialImagePrompts**: An array of ${numberOfInitialPrompts} detailed, structured Narrative Image Prompts for key scenes from the script.

All string values in the JSON object MUST be in ${langName}, except for the image prompts which MUST be in ENGLISH.

--- MRBEAST_THUMBNAIL_PROMPT_GUIDELINES ---
${MRBEAST_THUMBNAIL_PROMPT_GUIDELINES}
---

--- NARRATIVE IMAGE PROMPT GUIDELINES ---
${NARRATIVE_IMAGE_PROMPT_GUIDELINES}
---
${CRITICAL_OUTPUT_RULES}
`;

    const titledPromptSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'A short, descriptive title for the image prompt.' },
            prompt: { type: Type.STRING, description: 'The full, detailed, structured Narrative Image Prompt. Must be in English.' }
        },
        required: ['title', 'prompt']
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            thumbnailPrompt: { ...titledPromptSchema, description: `A structured Narrative Image Prompt for the video thumbnail. ${thumbnailText ? `The **Text:** section MUST incorporate the text: "${thumbnailText}"` : ''}` },
            initialImagePrompts: {
                type: Type.ARRAY,
                description: `An array of ${numberOfInitialPrompts} structured Narrative Image Prompts for key scenes.`,
                items: titledPromptSchema
            }
        },
        required: ['thumbnailPrompt', 'initialImagePrompts']
    };

    const requestPayload = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        }
    };

    const response = await makeApiCall('generateInitialVisuals', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
};


export const generateThumbnailSuggestions = async (
    topic: string,
    summary: string,
    period: string | undefined,
    location: string | undefined,
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    thumbnailText?: string,
): Promise<ThumbnailSuggestion[]> => {
    const langName = supportedLanguages[language]?.name || 'English';
    const prompt = `
You are a world-class YouTube thumbnail designer and strategist. Your goal is to weaponize curiosity. Every element—the expression, the text, the contrast—must contribute to an overwhelming urge to click to find out 'what happens next' or 'what am I looking at?'.
Your task is to generate 3 distinct, high-impact thumbnail concepts for a video with the following details:
- Topic: "${topic}"
- Summary: "${summary}"
${thumbnailText ? `- The thumbnail MUST include this text: "${thumbnailText}"` : ''}

For each of the 3 concepts, provide a detailed breakdown following these "MrBeast" principles:
1.  **Extreme Contrast:** Find the biggest contrast in the story (e.g., cheap vs. expensive, safe vs. dangerous, small vs. massive).
2.  **Exaggerated Emotion:** The concept must feature a person with a clear, over-the-top emotion (shock, joy, fear).
3.  **Simple Story:** The visual must tell a simple story in one glance.
4.  **Bold Text:** The text overlay must be short, punchy, and create curiosity.

All string values in the JSON output must be in ${langName}.
${CRITICAL_OUTPUT_RULES}
`;
    
    const responseSchema = {
        type: Type.ARRAY,
        description: 'An array of 3 distinct thumbnail suggestions.',
        items: {
            type: Type.OBJECT,
            properties: {
                concept: { type: Type.STRING, description: 'A short, catchy name for this thumbnail concept (e.g., "The $1 Hut vs The $100M Palace").' },
                visuals: { type: Type.STRING, description: 'A detailed description of the main visual elements. What is the subject? What is happening?' },
                textOverlay: {
                    type: Type.OBJECT,
                    properties: {
                        primary: { type: Type.STRING, description: `The main, attention-grabbing Call to Action text. Must be short and bold (e.g., "$1 vs $100M", "I Survived!"). ${thumbnailText ? `Must include: "${thumbnailText}"` : ''}` },
                        alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        fontSuggestion: { type: Type.STRING, description: `Suggest a font style (e.g., "Extra-bold, impactful sans-serif like 'Obelix Pro'").` }
                    },
                    required: ['primary', 'alternatives', 'fontSuggestion']
                },
                colorAndMood: {
                    type: Type.OBJECT,
                    properties: {
                        palette: { type: Type.STRING, description: 'Describe the color palette (e.g., "High-contrast, vibrant, and saturated colors").' },
                        mood: { type: Type.STRING, description: 'Describe the overall mood (e.g., "Exciting and shocking", "Epic and unbelievable").' }
                    },
                     required: ['palette', 'mood']
                },
                layout: { type: Type.STRING, description: 'Describe the composition and layout of the elements (e.g., "Subject on the left, text on the right").' },
                whyItWorks: { type: Type.STRING, description: 'Explain the psychological reason why this thumbnail will attract clicks.' }
            },
            required: ['concept', 'visuals', 'textOverlay', 'colorAndMood', 'layout', 'whyItWorks']
        }
    };

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };
    const response = await makeApiCall('generateThumbnailSuggestions', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
};

export const generateRecommendedStyles = async (
    summary: string,
    characters: string | undefined,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<string[]> => {
    const styleNames = styles.map(s => s.name);
    const prompt = `
You are an AI art director with an encyclopedic knowledge of art history and digital trends. Your task is to act as a creative consultant.
Analyze the story summary's mood, period, and subject matter, then recommend the top 5 most suitable art styles from the provided list to visually elevate the narrative.

--- Story Summary ---
${summary}
--- End Summary ---

${characters ? `--- Characters ---\n${characters}\n--- End Characters ---` : ''}

--- Available Styles ---
${styleNames.join(', ')}
--- End Available Styles ---

Respond with a JSON array containing the names of the 5 best-fitting styles. For example: ["Style 1", "Style 2", "Style 3", "Style 4", "Style 5"].
${CRITICAL_OUTPUT_RULES}
`;

    const responseSchema = {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    };

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };
    const response = await makeApiCall('generateRecommendedStyles', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
}

export const generateSSML = async (
    scriptPart: string,
    generationMode: 'quality' | 'speed',
    language: LanguageCode,
    ssmlStyle: SSMLStyle,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<string> => {
    const langCode = supportedLanguages[language]?.ssmlCode || 'en-US';
    const systemInstruction = `You are an expert in Speech Synthesis Markup Language (SSML). Your task is to convert the provided text into SSML format for a text-to-speech engine.`;

    let styleInstruction = '';
    switch(ssmlStyle) {
        case 'storyteller':
            styleInstruction = 'Use a wide range of expressiveness. Employ <emphasis>, <prosody rate="..." pitch="...">, and pauses <break time="..."/> to create a dramatic, engaging, and emotional storytelling performance.';
            break;
        case 'podcast':
            styleInstruction = 'Use a conversational and energetic style. Use pauses <break time="..."/> for natural speech rhythm and <emphasis> for key points, but avoid overly dramatic pitch or rate changes.';
            break;
        case 'announcer':
            styleInstruction = 'Use a formal, authoritative, and steady tone. Use minimal prosody changes and standard pauses. The delivery should be clear and objective.';
            break;
        case 'standard':
        default:
             styleInstruction = 'Use standard SSML markup. Add pauses <break time="..."/> between paragraphs and for dramatic effect where appropriate. Use <emphasis> tags for important words. Keep the tone relatively neutral unless the text implies emotion.';
            break;
    }

    const prompt = `
Convert the following script into SSML, using the language code "${langCode}".
${styleInstruction}
Do NOT add any explanation. Respond ONLY with the complete SSML, starting with <speak> and ending with </speak>.

--- SCRIPT ---
${scriptPart}
--- END SCRIPT ---
`;

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            systemInstruction,
            ...(model === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
        }
    };
    const response = await makeApiCall('generateSSML', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    // Clean the response to ensure it's valid SSML
    let ssml = response.text.trim();
    if (ssml.startsWith('```xml')) {
        ssml = ssml.substring(6);
    }
     if (ssml.startsWith('```')) {
        ssml = ssml.substring(3);
    }
    if (ssml.endsWith('```')) {
        ssml = ssml.substring(0, ssml.length - 3);
    }
    if (!ssml.startsWith('<speak')) {
        ssml = `<speak xml:lang="${langCode}">${ssml}</speak>`;
    }
    return ssml;
}

export const generateLayoutFromSuggestion = async (
    suggestion: ThumbnailSuggestion,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<{ elements: CanvasElement[], background: string }> => {
    const prompt = `
You are a visual layout AI. Your purpose is to translate an abstract design concept into a precise, structured JSON layout for a visual canvas that is 100x100 units.
Interpret the spatial language (e.g., 'on the left', 'in the background') and semantic descriptions (e.g., 'huge, impactful text') into concrete coordinates (x, y), dimensions (width, height), and properties. Be logical and creative in your placement to create a balanced and visually appealing composition.

Based on the provided thumbnail suggestion, generate a JSON object containing:
1. 'background': A string describing the background image.
2. 'elements': An array of objects representing text and visual elements on the canvas.

--- THUMBNAIL SUGGESTION ---
Concept: ${suggestion.concept}
Visuals: ${suggestion.visuals}
Text Overlay: ${suggestion.textOverlay.primary}
Layout: ${suggestion.layout}
--- END SUGGESTION ---

Respond ONLY with the JSON object.
${CRITICAL_OUTPUT_RULES}
`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            background: { type: Type.STRING, description: 'A detailed description of the background image.' },
            elements: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['text', 'object'] },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER },
                        content: { type: Type.STRING },
                        fontSize: { type: Type.NUMBER },
                        rotation: { type: Type.NUMBER },
                        zIndex: { type: Type.NUMBER },
                    },
                    required: ['id', 'type', 'x', 'y', 'width', 'height', 'content', 'fontSize', 'rotation', 'zIndex']
                }
            }
        },
        required: ['background', 'elements']
    };
    
    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };

    const response = await makeApiCall('generateLayoutFromSuggestion', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    const layout = JSON.parse(response.text);
    // Ensure IDs are unique, as the model might not guarantee it
    layout.elements.forEach((el: CanvasElement, index: number) => {
        el.id = `el_${Date.now()}_${index}`;
    });
    return layout;
}

export const generateCuesAndPromptsForPart = async (
    scriptPart: string,
    summary: string,
    characters: string | undefined,
    startCueNumber: number,
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<{ scriptWithCues: string, prompts: TitledPrompt[] }> => {
    const langName = supportedLanguages[language]?.name || 'English';
    const prompt = `
You are an AI video director. Your task is to analyze a script segment, insert visual cues, and generate corresponding image prompts.
The overall video summary is: "${summary}"
${characters ? `The main characters are: "${characters}"` : ''}

1.  **Analyze the Script:** Read the script part below and identify 3-5 key moments that need a strong visual.
2.  **Insert Cues:** In the script, insert cues like "[CUE:${startCueNumber}]", "[CUE:${startCueNumber+1}]", etc., at the exact points where a new visual should appear.
3.  **Generate Prompts:** For each cue, create a detailed, structured Narrative Image Prompt. These prompts must be in ENGLISH.

The response must be a single JSON object with two keys:
- "scriptWithCues": The original script with the [CUE:X] markers inserted. Must be in ${langName}.
- "prompts": An array of TitledPrompt objects, one for each cue.

--- NARRATIVE IMAGE PROMPT GUIDELINES ---
${NARRATIVE_IMAGE_PROMPT_GUIDELINES}
---

--- SCRIPT PART ---
${scriptPart}
--- END SCRIPT PART ---
${CRITICAL_OUTPUT_RULES}
`;
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            scriptWithCues: { type: Type.STRING, description: `The script part with [CUE:X] markers inserted. Must be in ${langName}.` },
            prompts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'A short title for the prompt.' },
                        prompt: { type: Type.STRING, description: 'The full Narrative Image Prompt in English.' }
                    },
                    required: ['title', 'prompt']
                }
            }
        },
        required: ['scriptWithCues', 'prompts']
    };

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };
    
    const response = await makeApiCall('generateCuesAndPromptsForPart', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
}

export const generateImagePrompts = async (
    topic: string,
    summary: string,
    characters: string | undefined,
    count: number,
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<TitledPrompt[]> => {
    const prompt = `
You are an AI art director. Generate ${count} diverse, detailed, and structured Narrative Image Prompts for a video about "${topic}".
The video summary is: "${summary}"
${characters ? `The characters are: "${characters}"` : ''}

The prompts must be in ENGLISH and follow the guidelines below.

--- NARRATIVE IMAGE PROMPT GUIDELINES ---
${NARRATIVE_IMAGE_PROMPT_GUIDELINES}
---

Respond with a JSON array of TitledPrompt objects.
${CRITICAL_OUTPUT_RULES}
`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                prompt: { type: Type.STRING }
            },
            required: ['title', 'prompt']
        }
    };

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };
    
    const response = await makeApiCall('generateImagePrompts', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
};

export const generateEditingTimeline = async (
    script: string[],
    summary: string,
    characters: string | undefined,
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<EditingSuggestion[]> => {
    const fullScript = script.join('\n\n');
    const langName = supportedLanguages[language]?.name || 'English';
    
    const prompt = `
You are an expert video editor with a keen sense of pacing and emotional impact. Analyze the following video script and create a detailed editing timeline.
For each key moment, create a suggestion with a timestamp, visuals, text overlays, sound/music, and a rationale. Your suggestions should build tension, create moments of reflection, and keep the viewer engaged.

- Video Summary: ${summary}
- Characters: ${characters || 'N/A'}
- Full Script:
---
${fullScript}
---

Generate a JSON array of editing suggestions. Timestamps must be in "mm:ss" format.
The response's string values must be in ${langName}.
${CRITICAL_OUTPUT_RULES}
`;
    
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                script_cue: { type: Type.STRING, description: "The first few words of the script line this suggestion applies to." },
                visuals: { type: Type.STRING, description: "Detailed description of the visuals (B-roll, animation, etc.)." },
                text_overlay: { type: Type.STRING, description: "Text to display on screen. Use 'None' if not applicable." },
                sound_and_music: { type: Type.STRING, description: "Sound effects and music cues." },
                rationale: { type: Type.STRING, description: "Why this editing choice is effective." },
                timestamp: { type: Type.STRING, description: "Timestamp in 'mm:ss' format." },
                duration_seconds: { type: Type.NUMBER, description: "Estimated duration of this shot in seconds." },
            },
            required: ['script_cue', 'visuals', 'text_overlay', 'sound_and_music', 'rationale', 'timestamp', 'duration_seconds']
        }
    };
    
    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };
    
    const response = await makeApiCall('generateEditingTimeline', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
};

export const generateChapters = async (
    script: string[],
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<Chapter[]> => {
    const fullScript = script.join('\n\n');
    const langName = supportedLanguages[language]?.name || 'English';

    const prompt = `
You are an AI content strategist specializing in YouTube audience retention. Your task is to analyze a script and create logical, compelling chapter markers.
The chapter titles should be short, intriguing, and accurately reflect the content of the section to encourage viewers to navigate the video.

Generate a JSON array of chapter objects. The first chapter must be at "00:00" and titled "Introduction".
The response's string values must be in ${langName}.

--- SCRIPT ---
${fullScript}
--- END SCRIPT ---
${CRITICAL_OUTPUT_RULES}
`;
    
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                timestamp: { type: Type.STRING, description: "Timestamp in 'mm:ss' format." },
                title: { type: Type.STRING, description: "The chapter title." }
            },
            required: ['timestamp', 'title']
        }
    };

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };

    const response = await makeApiCall('generateChapters', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
};

export const generatePromptFromLayout = async (
    background: string,
    elements: CanvasElement[],
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    stylePrompt: string
): Promise<string> => {
    const layoutDescription = elements.map(el => {
        return `- A ${el.type} element with content "${el.content}" at position (x:${el.x.toFixed(0)}%, y:${el.y.toFixed(0)}%) with size (${el.width.toFixed(0)}% width, ${el.height.toFixed(0)}% height) and rotation ${el.rotation}°`;
    }).join('\n');

    const prompt = `
You are an AI art director. Translate a structured layout into a detailed, structured Narrative Image Prompt ready for an image generator.

--- LAYOUT DETAILS ---
Background: ${background}
Elements:
${layoutDescription}
--- END LAYOUT DETAILS ---

Combine these details into a single Narrative Image Prompt. The prompt MUST be in ENGLISH and follow the guidelines below.
The final **Style:** section must be: "${stylePrompt}".

--- NARRATIVE IMAGE PROMPT GUIDELINES ---
${NARRATIVE_IMAGE_PROMPT_GUIDELINES}
---

Respond ONLY with the complete, structured prompt text.
${CRITICAL_OUTPUT_RULES}
`;

    const requestPayload = { model, contents: prompt };
    const response = await makeApiCall('generatePromptFromLayout', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return response.text;
};

export const generateSEOTags = async (
    topic: string,
    summary: string,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<string> => {
    const prompt = `You are a YouTube SEO expert. Your task is to generate a highly effective, comma-separated list of 15-20 YouTube tags for a video with the following details.
Topic: "${topic}"
Summary: "${summary}"

Use Google Search to research top-ranking videos and identify the most relevant and high-traffic keywords and phrases. The tags should include a mix of broad (e.g., "History", "Documentary"), specific (e.g., "Roman Empire", "Julius Caesar"), and long-tail keywords (e.g., "daily life of a roman soldier", "what did roman legionaries eat").

Respond ONLY with the comma-separated list of tags. Do not include any other text or formatting.`;

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
    };
    
    const response = await makeApiCall('generateSEOTags', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return response.text.trim();
};