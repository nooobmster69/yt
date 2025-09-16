import { Type, Modality } from "@google/genai";
import { makeApiCall, getAiClientForTask } from './apiService';
import { 
    constructBaseSystemInstruction, 
    constructMetadataPrompt, 
    constructWelcomePrompt, 
    constructCreativeAngleInstruction,
    CRITICAL_OUTPUT_RULES,
    SEARCH_GUIDELINES,
    ADAPTIVE_WRITING_TECHNIQUES
} from './promptService';
import { cleanGeneratedText, WPM } from './utils';
import type { AILogEntry, BrandNewStyleSuggestion, CreativeAngle, GroundingChunk, ImageAspectRatio, ImageGenerationModel, LanguageCode, ScriptStyle, ScriptStyleDetail, StyleSuggestion, TitledPrompt, WelcomeStyle } from '../types';
import { supportedLanguages } from '../types';

// --- NEW INTERFACE ---
export interface StoryOutline {
    chapters: { title: string; durationMinutes: number }[];
    summary: string;
    period: string;
    location: string;
    characters?: string;
}

export async function* generateYouTubeContent(
    channelName: string, 
    topic: string, 
    storyBrief: string,
    storyFocus: 'personal' | 'general', 
    scriptStyle: ScriptStyle,
    creativeAngle: CreativeAngle,
    useSimpleWords: boolean,
    useDailyLanguage: boolean,
    useExtendedGeneration: boolean,
    useGoogleSearch: boolean,
    totalDurationMinutes: number,
    generationMode: 'quality' | 'speed',
    generationModel: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    language: LanguageCode,
    summaryWordCount: number,
    numberOfInitialPrompts: number,
    welcomeStyle: WelcomeStyle,
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    welcomeScriptConcept?: string,
    mentionChannelNameInWelcome?: boolean,
    thumbnailText?: string,
    contentTone?: string
): AsyncGenerator<{ type: 'metadata' | 'scriptChunk' | 'done' | 'groundingChunk', data?: any, chunk?: string, groundingChunks?: GroundingChunk[] }> {
    
    // --- STEP 1: Generate Metadata ---
    const { prompt: metadataPrompt, responseSchema: metadataSchema } = constructMetadataPrompt(
        topic, storyBrief, storyFocus, language, summaryWordCount, numberOfInitialPrompts, thumbnailText
    );
    
    const metadataRequest = {
        model: generationModel,
        contents: metadataPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: metadataSchema,
        }
    };
    
    const metadataResponse = await makeApiCall('generateMetadata', log, () => getAiClientForTask('text').models.generateContent(metadataRequest), metadataRequest);
    const metadata = JSON.parse(metadataResponse.text);
    yield { type: 'metadata', data: metadata };

    // --- STEP 2: Generate Script via Streaming ---
    const systemInstruction = constructBaseSystemInstruction(scriptStyle);
    
    let storyFocusInstruction: string;
    let introInstruction: string;
    let outroInstruction: string;

    const targetLanguageName = supportedLanguages[language]?.name || "English";
    const languageInstruction = `\n\n--- LANGUAGE RULE (NON-NEGOTIABLE) ---\nYou MUST write the entire response exclusively in **${targetLanguageName}**.`;
    const formattingRule = `**Formatting Rule (ABSOLUTE):** Separate every paragraph with a double newline (\\n\\n). This creates clean spacing and is CRITICAL for readability. Do not use single newlines between paragraphs.`;
    const creativeAngleInstruction = constructCreativeAngleInstruction(creativeAngle);
    const narrativeStyleRules = `--- NARRATIVE STYLE & ATMOSPHERE RULES (CRITICAL) ---\n- **Formatting:** ${formattingRule}\n${ADAPTIVE_WRITING_TECHNIQUES}`;

    if (scriptStyle === 'creative-story') {
        if (storyFocus === 'personal') {
            storyFocusInstruction = `The main story MUST focus on the personal, emotional journey of the main characters: ${metadata.characters}. Write it as a novel, not a script.`;
        } else {
            storyFocusInstruction = `The story MUST be a comprehensive, creative narrative about the topic: "${topic}". Write it as a novel, not a script.`;
        }
        introInstruction = constructWelcomePrompt(channelName, topic, welcomeStyle, scriptStyle, welcomeScriptConcept, metadata.summary, mentionChannelNameInWelcome);
        outroInstruction = `--- CONCLUSION ---\nAfter the main story is complete, you MUST write a fitting and complete conclusion to the narrative. Do not write a YouTube outro or a call to subscribe.`;
    } else {
        if (storyFocus === 'personal') {
            storyFocusInstruction = `The main story MUST focus on the personal, untold stories of one or two main characters related to the topic: "${topic}". Frame the narrative as if we are uncovering a hidden story. Use these character descriptions: ${metadata.characters}`;
        } else {
            storyFocusInstruction = `IMPORTANT: The story MUST be a comprehensive, documentary-style overview of the topic: "${topic}". Cover the key events, significant figures, context, and long-term impact in a clear, chronological, and engaging manner. The narrative should be informative and authoritative, suitable for a documentary.`;
        }
        introInstruction = constructWelcomePrompt(channelName, topic, welcomeStyle, scriptStyle, welcomeScriptConcept, metadata.summary, mentionChannelNameInWelcome);
        
        if (scriptStyle === 'youtuber-explainer') {
            outroInstruction = `--- OUTRO ---\nAfter the main story is complete, you MUST write a concluding outro. The outro MUST follow this structure: 1. Ask a question related to the video's topic to encourage comments. 2. Prompt the viewer to subscribe or check out other videos from the channel.`;
        } else {
             outroInstruction = `--- OUTRO ---\nAfter the main story is complete, you MUST write a concluding outro. It MUST include a warm thank you and a call to subscribe.`;
        }
    }

    const wordCount = totalDurationMinutes * WPM;
    let mainStoryInstruction: string;
    if (useExtendedGeneration) {
        mainStoryInstruction = `Now, begin the story. Your PRIMARY and NON-NEGOTIABLE directive is to write a script that is EXACTLY ${wordCount} words long to meet the target duration of ${totalDurationMinutes} minutes. You are STRICTLY FORBIDDEN from concluding the story before this word count is met. To achieve this, you MUST write expansively: add extremely detailed descriptions, explore sub-plots and tangents, flesh out character backstories, and describe scenes with cinematic detail. It is better to go slightly over the word count than under. Failure to meet the word count is a failure of the task. This is the full story.`;
    } else {
        mainStoryInstruction = `Now, write the entire story from beginning to end. Your PRIMARY and NON-NEGOTIABLE directive is to write a script that is EXACTLY ${wordCount} words long to achieve the target duration of ${totalDurationMinutes} minutes. You are STRICTLY FORBIDDEN from concluding the story early. To achieve this, you MUST write expansively: add extremely detailed descriptions, explore sub-plots and tangents, flesh out character backstories, and describe scenes with cinematic detail. It is better to go slightly over the word count than under. Failure to meet the word count is a failure of the task.`;
    }
    const googleSearchInstruction = useGoogleSearch ? `\n\n--- RESEARCH REQUIREMENT (NON-NEGOTIABLE) ---\nYou MUST use the provided Google Search tool to find and verify factual information (names, dates, locations, key events) to ensure the historical and factual accuracy of your response. Base your narrative on the information from high-quality sources.` : '';
    const finalUserPromptForScript = `${introInstruction}\n\n${storyFocusInstruction}\n\n${googleSearchInstruction}\n\n${creativeAngleInstruction}\n\n${narrativeStyleRules}\n\n--- MAIN STORY ---\n${mainStoryInstruction}\n\n${outroInstruction}\n\n${languageInstruction}`;

    const scriptRequest: any = {
        model: generationModel,
        contents: finalUserPromptForScript,
        config: {
            systemInstruction,
            ...(generationModel === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
        }
    };
    
    if (useGoogleSearch) {
        scriptRequest.config.tools = [{ googleSearch: {} }];
    }

    const stream = await getAiClientForTask('text').models.generateContentStream(scriptRequest);
    for await (const chunk of stream) {
        const text = chunk.text;
        if(text) {
            yield { type: 'scriptChunk', chunk: cleanGeneratedText(text) };
        }
        const rawChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingChunks: GroundingChunk[] = rawChunks.filter((c: any): c is GroundingChunk => c?.web?.uri && c?.web?.title);
        if (groundingChunks.length > 0) {
             yield { type: 'groundingChunk', groundingChunks };
        }
    }

    yield { type: 'done' };
};

export const performInitialSearch = async (
    topic: string,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void
): Promise<{ summary: string; groundingChunks: GroundingChunk[] }> => {
    const prompt = `Based on Google Search results, provide a comprehensive and detailed summary of the topic: "${topic}". Focus on key events, people, and the most important information a documentary would cover. Respond with ONLY the summary text.\n\n${SEARCH_GUIDELINES}`;
    const requestPayload: any = { model, contents: prompt, config: { tools: [{ googleSearch: {} }] } };
    const response = await makeApiCall('performInitialSearch', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    const summary = (response.text || '').trim();
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingChunks: GroundingChunk[] = rawChunks.filter((c: any): c is GroundingChunk => c?.web?.uri && c?.web?.title);
    return { summary, groundingChunks };
}


export const generateChapterOutline = async (
    topic: string,
    storyBrief: string,
    totalDurationMinutes: number,
    storyFocus: 'personal' | 'general',
    creativeAngle: CreativeAngle,
    language: LanguageCode,
    summaryWordCount: number,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void
): Promise<StoryOutline> => {
    const langName = supportedLanguages[language]?.name || 'English';
    const creativeAngleInstruction = constructCreativeAngleInstruction(creativeAngle);
    
    // Use longer chapters for longer content to keep the chapter count reasonable.
    const averageChapterDuration = totalDurationMinutes > 60 ? 10 : 7; 
    const approximateChapterCount = Math.max(5, Math.round(totalDurationMinutes / averageChapterDuration));
    
    const prompt = `
You are an expert content planner and story architect for a YouTube channel.
The video topic is: "${topic}".
The target video duration is approximately ${totalDurationMinutes} minutes.
${storyBrief ? `The user has provided a topic guide: "${storyBrief}"` : ''}
${creativeAngleInstruction}

Your task is to create a blueprint for the video script, focusing ONLY on the narrative structure and metadata. You must generate:
1.  **chapters**: A JSON array of objects. Each object must have a "title" (a descriptive chapter title) and a "durationMinutes" (an estimated integer duration for that chapter).
    - CRITICAL: Divide the story into multiple thematic chapters to cover the topic comprehensively. To meet the target duration, you should aim to generate approximately **${approximateChapterCount} chapters**.
    - The first chapter title MUST be "Introduction".
    - **CRITICAL DURATION REQUIREMENT:** The sum of all chapter "durationMinutes" MUST be EXACTLY equal to the target video duration of ${totalDurationMinutes} minutes. Do not deviate from this total. Adjust the number and length of chapters to meet this requirement precisely.
2.  **summary**: A concise ${summaryWordCount}-word summary of the complete story that will be told across all chapters.
3.  **period**: A short description of the historical period and year(s).
4.  **location**: A short description of the primary geographical location.
${storyFocus === 'personal' ? '5. **characters**: A detailed description of the main characters, including names and visual features for consistency.' : ''}

Do NOT generate image, thumbnail prompts, or tags.

The response's string values MUST be in ${langName}, except for the JSON keys, which should be in English.
${CRITICAL_OUTPUT_RULES}
`;

    const schemaProperties: any = {
        chapters: {
            type: Type.ARRAY,
            description: "List of chapters for the story, each with a title and estimated duration.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the chapter." },
                    durationMinutes: { type: Type.NUMBER, description: "The estimated duration of this chapter in minutes." }
                },
                required: ["title", "durationMinutes"]
            }
        },
        summary: { type: Type.STRING, description: `A concise ${summaryWordCount}-word summary of the complete story that will be told across all chapters.` },
        period: { type: Type.STRING, description: `A short description of the historical period and year(s) the story takes place in (e.g., "Late Cretaceous Period, 66 million years ago", "WWII, 1944"). Must be in ${langName}.` },
        location: { type: Type.STRING, description: `A short description of the primary geographical location of the story (e.g., "Egypt", "Normandy, France"). Must be in ${langName}.` },
    };
    
    const requiredFields = ['chapters', 'summary', 'period', 'location'];

    if (storyFocus === 'personal') {
        schemaProperties.characters = { type: Type.STRING, description: "A detailed description of the main characters, including their names, approximate age, and key visual features for image generation consistency." };
        requiredFields.push('characters');
    }

    const responseSchema = {
        type: Type.OBJECT,
        properties: schemaProperties,
        required: requiredFields
    };

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        }
    };
    
    const response = await makeApiCall('generateChapterOutline', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    const outline = JSON.parse(response.text) as StoryOutline;

    // --- DURATION NORMALIZATION STEP ---
    // This corrects the AI's tendency to not perfectly sum the chapter durations.
    const actualTotalDuration = outline.chapters.reduce((sum, chapter) => sum + chapter.durationMinutes, 0);

    if (actualTotalDuration > 0 && actualTotalDuration !== totalDurationMinutes) {
        console.warn(`AI-generated duration (${actualTotalDuration}min) does not match requested duration (${totalDurationMinutes}min). Normalizing...`);

        const scalingFactor = totalDurationMinutes / actualTotalDuration;
        const scaledDurations = outline.chapters.map(c => c.durationMinutes * scalingFactor);
        
        const roundedDurations = scaledDurations.map(d => Math.floor(d));
        let currentSum = roundedDurations.reduce((sum, d) => sum + d, 0);
        
        const remainders = scaledDurations.map((d, index) => ({
            index,
            remainder: d - roundedDurations[index]
        }));
        
        remainders.sort((a, b) => b.remainder - a.remainder);
        
        let difference = totalDurationMinutes - currentSum;
        
        for (let i = 0; i < difference; i++) {
            // Distribute the remainder minutes to the chapters with the largest fractions
            const chapterToAdjustIndex = remainders[i].index;
            roundedDurations[chapterToAdjustIndex]++;
        }
        
        // Final check for sum, although it should be correct. This is a safeguard.
        const finalSum = roundedDurations.reduce((sum, d) => sum + d, 0);
        if (finalSum !== totalDurationMinutes) {
            console.error("Duration normalization failed. Sum is incorrect.", { finalSum, totalDurationMinutes });
            const finalDifference = totalDurationMinutes - finalSum;
            roundedDurations[roundedDurations.length - 1] += finalDifference;
        }

        outline.chapters = outline.chapters.map((chapter, index) => ({
            ...chapter,
            durationMinutes: roundedDurations[index]
        }));
    }

    return outline;
};

export async function* generateScriptForChapters(
    topic: string,
    chapters: { title: string; durationMinutes: number }[],
    fullChapterList: string[],
    previousContext: string,
    scriptStyle: ScriptStyle,
    creativeAngle: CreativeAngle,
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    useGoogleSearch: boolean
): AsyncGenerator<{ type: 'scriptChunk', chunk: string } | { type: 'groundingChunk', groundingChunks: GroundingChunk[] }> {
    const langName = supportedLanguages[language]?.name || 'English';
    const systemInstruction = constructBaseSystemInstruction(scriptStyle);
    const creativeAngleInstruction = constructCreativeAngleInstruction(creativeAngle);
    const chapterDetails = chapters.map(c => `- ${c.title} (${c.durationMinutes} minutes)`).join('\n');
    const totalBatchDuration = chapters.reduce((sum, c) => sum + c.durationMinutes, 0);
    const wordCount = totalBatchDuration * WPM;

    const prompt = `
You are continuing to write a long-form ${scriptStyle === 'creative-story' ? 'story' : 'video script'}.
The video topic is: "${topic}".
The full list of chapters for the entire video is: ${fullChapterList.join(', ')}.
You have already written the following content:
--- PREVIOUS SCRIPT CONTEXT (DO NOT REPEAT) ---
...${previousContext.slice(-4000)}
--- END CONTEXT ---

${creativeAngleInstruction}
${ADAPTIVE_WRITING_TECHNIQUES}

Your current task is to write the script ONLY for the following chapters:
${chapterDetails}

Your CRITICAL and NON-NEGOTIABLE task is to write a detailed ${scriptStyle === 'creative-story' ? 'prose section' : 'script'} that is EXACTLY ${wordCount} words long for these chapters. You are FORBIDDEN from writing less than this amount. To achieve this, you MUST expand on every detail, add rich descriptions, explore side-narratives, and elaborate on character thoughts and motivations. Do not summarize. Do not conclude the story arc of these chapters. Treat this as one part of a much larger saga. Ensure a smooth transition from the previous content.

Do NOT write an introduction or conclusion for the whole ${scriptStyle === 'creative-story' ? 'story' : 'video'}, only the content for the chapters listed above.
The response's string values MUST be in ${langName}.
`;
    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            systemInstruction,
            ...(useGoogleSearch && { tools: [{ googleSearch: {} }] })
        }
    };

    const stream = await getAiClientForTask('text').models.generateContentStream(requestPayload);
    for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
            yield { type: 'scriptChunk', chunk: cleanGeneratedText(text) };
        }
        const rawChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingChunks: GroundingChunk[] = rawChunks.filter((c: any): c is GroundingChunk => c?.web?.uri && c?.web?.title);
        if (groundingChunks.length > 0) {
             yield { type: 'groundingChunk', groundingChunks };
        }
    }
}

export const generateWelcomeScript = async (
    channelName: string,
    topic: string,
    welcomeStyle: WelcomeStyle,
    scriptStyle: ScriptStyle,
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    useGoogleSearch: boolean,
    welcomeScriptConcept?: string,
    summary?: string,
    mentionChannelNameInWelcome?: boolean,
): Promise<{ script: string, groundingChunks: GroundingChunk[] | null }> => {
    const langName = supportedLanguages[language]?.name || 'English';
    const prompt = `${constructWelcomePrompt(channelName, topic, welcomeStyle, scriptStyle, welcomeScriptConcept, summary, mentionChannelNameInWelcome)}
    --- LANGUAGE RULE (NON-NEGOTIABLE) ---
    You MUST write the entire response exclusively in **${langName}**.
    `;
    const systemInstruction = constructBaseSystemInstruction(scriptStyle);

    const requestPayload: any = {
        model,
        contents: prompt,
        config: {
            systemInstruction,
            ...(useGoogleSearch && { tools: [{ googleSearch: {} }] })
        }
    };
    
    const response = await makeApiCall('generateWelcomeScript', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    const script = cleanGeneratedText(response.text || '');
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingChunks: GroundingChunk[] = rawChunks.filter((c: any): c is GroundingChunk => c?.web?.uri && c?.web?.title);
    
    return { script, groundingChunks: groundingChunks.length > 0 ? groundingChunks : null };
}

export const generateTopicSuggestions = async (
    language: LanguageCode,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<string[]> => {
    const langName = supportedLanguages[language]?.name || 'English';
    const prompt = `
You are a creative director for a popular YouTube channel focused on history, science, and fascinating stories.
Generate a list of 5 intriguing, clickable, and highly engaging video topic ideas.
Respond ONLY with a JSON array of strings.
All topics MUST be in ${langName}.
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
    const response = await makeApiCall('generateTopicSuggestions', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
}

const scriptStyleIds: ScriptStyle[] = ['narrative', 'creative-story', 'documentary', 'podcast', 'single-podcast', 'investigative', 'saga', 'youtuber-explainer', 'cosmic-odyssey', 'future-frontier', 'wonders-of-discovery', 'pulse-of-life', 'timeless-tales', 'enchanted-realms', 'mind-matters', 'ancient-earth-chronicles'];
const creativeAngleIds: CreativeAngle[] = ['standard', 'fun', 'plot-twist', 'outsmart'];
const welcomeStyleIds: WelcomeStyle[] = ['calm', 'energetic', 'mystery', 'scholarly', 'direct-to-camera', 'weird-history'];
const storyFocusIds: ('personal' | 'general')[] = ['personal', 'general'];

export const generateStyleSuggestion = async (
    topic: string,
    styleSuggestionGuide: string,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<StyleSuggestion> => {
    const prompt = `
You are an expert YouTube content strategist. Your goal is to recommend the optimal combination of narrative settings to create the most engaging video for the user's topic.

--- VIDEO DETAILS ---
Topic: "${topic}"
Style Suggestion Guide: "${styleSuggestionGuide || 'None provided.'}"

--- AVAILABLE OPTIONS ---
- Script Styles: ${scriptStyleIds.join(', ')}
- Creative Angles: ${creativeAngleIds.join(', ')}
- Story Focus: ${storyFocusIds.join(', ')}
- Welcome Styles: ${welcomeStyleIds.join(', ')}

--- YOUR TASK ---
Analyze the video details, paying close attention to the **Style Suggestion Guide**. Choose the SINGLE BEST option from EACH of the four categories above.
Provide a compelling rationale explaining why this specific combination is the most effective for this topic. For example, if the guide says "for sleeping", you must recommend calm and narrative styles.

Your response MUST be a JSON object with the following keys: "scriptStyle", "creativeAngle", "storyFocus", "welcomeStyle", and "rationale".
${CRITICAL_OUTPUT_RULES}
`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            scriptStyle: { type: Type.STRING, enum: scriptStyleIds },
            creativeAngle: { type: Type.STRING, enum: creativeAngleIds },
            storyFocus: { type: Type.STRING, enum: storyFocusIds },
            welcomeStyle: { type: Type.STRING, enum: welcomeStyleIds },
            rationale: { type: Type.STRING, description: "A compelling justification for why this combination is the best fit for the topic." }
        },
        required: ["scriptStyle", "creativeAngle", "storyFocus", "welcomeStyle", "rationale"]
    };

    const requestPayload = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };

    const response = await makeApiCall('generateStyleSuggestion', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
};

export const generateBrandNewStyle = async (
    topic: string,
    styleSuggestionGuide: string,
    model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<BrandNewStyleSuggestion> => {
    const prompt = `
You are a viral YouTube content strategist and a world-class narrative designer, famous for creating unique and addictive show formats. Your task is to invent a COMPLETELY NEW, custom-tailored narrative DNA for a YouTube video based on the user's topic and guide. The goal is to create a style that maximizes audience retention, builds a strong channel brand, and feels completely fresh. Do not use pre-existing templates; invent everything.

--- YOUTUBE VIDEO DETAILS ---
Topic: "${topic}"
Style Suggestion Guide: "${styleSuggestionGuide || 'None provided.'}"

--- YOUR TASK ---
Invent a unique and compelling narrative package specifically for a YouTube audience. Your response MUST be a JSON object containing the following invented fields:

- "scriptStyleName": A catchy, evocative name for a brand new script style that sounds like a unique YouTube show format (e.g., "Chronoscape Detective," "Mythic Technologist," "Quantum Histories").
- "scriptStyleDescription": A one-sentence description of this new style, explaining its tone and format for a YouTube video.
- "creativeAngleName": A name for a custom creative angle that acts as the video's core 'hook' or 'gimmick' (e.g., "The Hidden Connection," "Reversal of Fortune," "Five-Minute Expert").
- "creativeAngleDescription": A one-sentence description of this new angle and how it grabs the viewer's attention.
- "welcomeStyleName": A name for a custom welcome style that could become a signature intro for this format (e.g., "The Midnight Archive," "Urgent Bulletin," "The Curiosity Dive").
- "welcomeStyleDescription": A one-sentence description of this new welcome style and how it sets the tone for a YouTube video.
- "storyFocus": Choose either 'personal' or 'general', whichever is best for audience engagement on this topic.
- "rationale": A compelling paragraph explaining why this unique combination is the perfect, groundbreaking approach for a *YouTube video* on this specific topic, focusing on how it will hook viewers and keep them watching.

CRITICAL INSTRUCTION: Your entire response must be directly and deeply inspired by the **Style Suggestion Guide**. If the guide specifies an audience or tone (e.g., "for audience who listen when sleeping"), your invented styles MUST reflect that. For example, a sleep video's style name might be "Dream Weaver's Codex" and the welcome style "The Gentle Unfolding," with a rationale explaining why it's perfect for a relaxing experience.
${CRITICAL_OUTPUT_RULES}
`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            scriptStyleName: { type: Type.STRING },
            scriptStyleDescription: { type: Type.STRING },
            creativeAngleName: { type: Type.STRING },
            creativeAngleDescription: { type: Type.STRING },
            welcomeStyleName: { type: Type.STRING },
            welcomeStyleDescription: { type: Type.STRING },
            storyFocus: { type: Type.STRING, enum: ['personal', 'general'] },
            rationale: { type: Type.STRING }
        },
        required: [
            "scriptStyleName", "scriptStyleDescription",
            "creativeAngleName", "creativeAngleDescription",
            "welcomeStyleName", "welcomeStyleDescription",
            "storyFocus", "rationale"
        ]
    };

    const requestPayload = {
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema
        }
    };

    const response = await makeApiCall('generateBrandNewStyle', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return JSON.parse(response.text);
};


export const extendStory = async (
    fullScript: string,
    characters: string | undefined,
    topic: string,
    storyBrief: string,
    generationMode: 'quality' | 'speed',
    generationModel: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    scriptStyle: ScriptStyle,
    creativeAngle: CreativeAngle,
    language: LanguageCode,
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    contentTone?: string
): Promise<{ newScriptText: string }> => {
    const langName = supportedLanguages[language]?.name || 'English';
    const systemInstruction = constructBaseSystemInstruction(scriptStyle);
    const creativeAngleInstruction = constructCreativeAngleInstruction(creativeAngle);

    const prompt = `
You are continuing to write a long-form story. The story so far is:
--- STORY SO FAR (last 2000 characters for context) ---
...${fullScript.slice(-2000)}
--- END STORY SO FAR ---

The topic is "${topic}".
${storyBrief ? `Topic Guide: "${storyBrief}"` : ''}
${characters ? `Characters: "${characters}"` : ''}
${contentTone ? `The desired content tone is: "${contentTone}"` : ''}
${creativeAngleInstruction}

Continue the story from where it left off. Write the next part of the narrative. Do NOT write a conclusion. Do NOT repeat what has already been written. Just write the next section.
The response must be in ${langName}.
`;

    const requestPayload: any = {
        model: generationModel,
        contents: prompt,
        config: {
            systemInstruction,
            ...(generationModel === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
        }
    };

    const response = await makeApiCall('extendStory', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return { newScriptText: cleanGeneratedText(response.text) };
}

export const endStory = async (
    fullScript: string,
    characters: string | undefined,
    topic: string,
    storyBrief: string,
    channelName: string,
    useSimpleWords: boolean,
    useDailyLanguage: boolean,
    generationMode: 'quality' | 'speed',
    generationModel: 'gemini-2.5-flash' | 'gemini-2.5-pro',
    scriptStyle: ScriptStyle,
    creativeAngle: CreativeAngle,
    language: LanguageCode,
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
    contentTone?: string
): Promise<string> => {
     const langName = supportedLanguages[language]?.name || 'English';
     const systemInstruction = constructBaseSystemInstruction(scriptStyle);
     const creativeAngleInstruction = constructCreativeAngleInstruction(creativeAngle);

     const prompt = `
You are concluding a long-form story. The story so far is:
--- STORY SO FAR (last 2000 characters for context) ---
...${fullScript.slice(-2000)}
--- END STORY SO FAR ---

The topic was "${topic}".
${storyBrief ? `Topic Guide: "${storyBrief}"` : ''}
${characters ? `Characters: "${characters}"` : ''}
${contentTone ? `The desired content tone is: "${contentTone}"` : ''}
${creativeAngleInstruction}

${scriptStyle === 'creative-story' 
    ? 'Write a compelling and complete conclusion to the story. It should feel like the final chapter of a book. Do NOT add a YouTube outro.' 
    : `Write a compelling conclusion to the story. After the conclusion, add a YouTube outro that thanks the viewer for watching, encourages them to subscribe to the channel "${channelName}", and suggests they watch another video.`}
The response must be in ${langName}.
`;

    const requestPayload: any = {
        model: generationModel,
        contents: prompt,
        config: {
            systemInstruction,
            ...(generationModel === 'gemini-2.5-flash' && { thinkingConfig: { thinkingBudget: generationMode === 'speed' ? 0 : undefined }})
        }
    };

    const response = await makeApiCall('endStory', log, () => getAiClientForTask('text').models.generateContent(requestPayload), requestPayload);
    return cleanGeneratedText(response.text);
}

export const generateImage = async (
    prompt: string,
    model: ImageGenerationModel,
    aspectRatio: ImageAspectRatio,
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<string[]> => {

    if (model === 'gemini-2.5-flash-image-preview') {
        const generationCommand = `Generate a high-quality, detailed image with a ${aspectRatio} aspect ratio based on the following description:`;
        const modifiedPrompt = `${generationCommand}\n\n${prompt}`;
        
        const requestPayload = {
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [{ text: modifiedPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        };
        const response = await makeApiCall('generateImage (Gemini)', log, () => getAiClientForTask('image').models.generateContent(requestPayload), requestPayload);
        
        let imageBytes: string | null = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBytes = part.inlineData.data;
                    break;
                }
            }
        }
        if (!imageBytes) throw new Error(`Image generation with ${model} failed to return an image.`);
        return [imageBytes];
    } else {
        // Handle Imagen models
        const requestPayload = {
            model: model,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        };
        const response = await makeApiCall('generateImage (Imagen)', log, () => getAiClientForTask('image').models.generateImages(requestPayload), requestPayload);
        const base64DataArray = response.generatedImages.map((img: any) => img.image.imageBytes);
        if (!base64DataArray || base64DataArray.length === 0) {
            throw new Error("Image generation failed to return any images.");
        }
        return base64DataArray;
    }
};

export const editImage = async (
    base64ImageData: string,
    mimeType: string,
    adjustmentPrompt: string,
    log: (logEntry: Omit<AILogEntry, 'id' | 'timestamp'>) => void,
): Promise<{ imageBytes: string; textResponse: string | null }> => {
    const requestPayload = {
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                { text: adjustmentPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    };

    const response = await makeApiCall('editImage', log, () => getAiClientForTask('image').models.generateContent(requestPayload), requestPayload);
    
    let imageBytes: string | null = null;
    let textResponse: string | null = null;

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                imageBytes = part.inlineData.data;
            } else if (part.text) {
                textResponse = (textResponse || '') + part.text;
            }
        }
    }

    if (!imageBytes) {
        throw new Error("Image editing failed to return an image.");
    }

    return { imageBytes, textResponse };
};