export const WPM = 150; // Words Per Minute for speech calculation

export const splitScriptIntoChunks = (script: string, wordsPerChunk: number): string[] => {
    const paragraphs = script.split(/\n\s*\n/).filter(p => p.trim() !== '');
    if (paragraphs.length === 0) {
        if (!script.trim()) return [];
        const words = script.split(/\s+/);
        const chunks: string[] = [];
        for (let i = 0; i < words.length; i += wordsPerChunk) {
            chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
        }
        return chunks.filter(c => c.trim());
    }

    const chunks: string[] = [];
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
        const currentChunkWordCount = currentChunk.split(/\s+/).filter(Boolean).length;
        const paragraphWordCount = paragraph.split(/\s+/).filter(Boolean).length;

        if (currentChunkWordCount > 0 && currentChunkWordCount + paragraphWordCount > wordsPerChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }
        currentChunk += paragraph + "\n\n";
    }

    if (currentChunk.trim() !== "") {
        chunks.push(currentChunk.trim());
    }
    return chunks;
};


export const cleanGeneratedText = (rawText: string): string => {
    if (!rawText) return '';
    let text = rawText;
    
    // Remove stray backslashes that might precede quotes. e.g., it\'s -> it's
    text = text.replace(/\\'/g, "'").replace(/\\"/g, '"');
    
    // Remove markdown-style chapter headings (e.g., "## **Chapter 1: ...**")
    text = text.replace(/^#+\s*.*?$/gm, '');

    // Remove bolded speaker labels like **NARRATOR:** or **ALEX:**, and any trailing spaces.
    text = text.replace(/^\s*\*\*[A-Z\s]+:\*\*\s*/gm, '');

    // Remove un-bolded speaker labels like NARRATOR: or ALEX:
    text = text.replace(/^\s*([A-Z]{3,}(\s[A-Z]+)*:)\s*/gm, '');

    // Remove bolded parenthetical cues and narrator directions, which may span multiple lines.
    // Example: **(The script begins. The music... as if sharing a secret by a fireside.)**
    text = text.replace(/\*\*\s*\([\s\S]*?\)\s*\*\*/g, '');

    // Remove empty bold markers like ** ** or ****
    text = text.replace(/\*\*\s*\*\*/g, '');

    // Remove all non-bolded parenthetical annotations (e.g., "(laughs)", "(sound of...)").
    // This removes all director/sound cues that are not part of the spoken dialogue.
    text = text.replace(/\([\s\S]*?\)/g, '');
    
    // Remove bracketed annotations like sound cues, but preserve Director Mode Cues.
    text = text.replace(/\[(?!\s*CUE:)[^\]]+\]/g, '');
    
    // Normalize multiple spaces into a single space, but preserve newlines.
    text = text.replace(/ +/g, ' ');

    // Clean up extra newlines created by replacements.
    // Replace 3+ newlines with two.
    text = text.replace(/\n{3,}/g, '\n\n');
    
    return text.trim();
};
