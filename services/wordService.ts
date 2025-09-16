import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import saveAs from 'file-saver';
import type { ProjectData, TitledPrompt } from '../types';
import { styles } from './imageStyles';

export const exportToDocx = async (projectData: ProjectData): Promise<void> => {
    const { channelName, topic, generatedContent: content } = projectData;
    if (!content) return;

    const { summary, characters, script, thumbnailPrompt, initialImagePrompts, scenePrompts, tags, groundingChunks, brandNewScriptStyle, brandNewCreativeAngle, brandNewWelcomeStyle } = content;

    const allScenePrompts = (scenePrompts || []).filter((p): p is TitledPrompt[] => Array.isArray(p)).flat();

    const createPromptParagraphs = (prompts: TitledPrompt[] | undefined, title: string) => {
        if (!prompts || prompts.length === 0) return [];
        const paragraphs = [new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 })];
        prompts.forEach(p => {
            paragraphs.push(new Paragraph({ text: p.title, heading: HeadingLevel.HEADING_3 }));
            paragraphs.push(new Paragraph({ text: p.prompt }));
        });
        return paragraphs;
    }

    const sections = [
        new Paragraph({ text: topic, heading: HeadingLevel.TITLE }),
        new Paragraph({ text: `For Channel: ${channelName}`, heading: HeadingLevel.HEADING_3 }),

        new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: summary }),
    ];
    
    if (characters) {
        sections.push(new Paragraph({ text: 'Characters', heading: HeadingLevel.HEADING_1 }));
        sections.push(new Paragraph({ text: characters }));
    }

    if (brandNewScriptStyle || brandNewCreativeAngle || brandNewWelcomeStyle) {
        sections.push(new Paragraph({ text: 'AI-Generated Narrative Style', heading: HeadingLevel.HEADING_1 }));
        if (brandNewScriptStyle) {
            sections.push(new Paragraph({ text: `Script Style: ${brandNewScriptStyle.title}`, heading: HeadingLevel.HEADING_2 }));
            sections.push(new Paragraph({ children: [new TextRun({ text: brandNewScriptStyle.description, italics: true })] }));
        }
        if (brandNewCreativeAngle) {
            sections.push(new Paragraph({ text: `Creative Angle: ${brandNewCreativeAngle.title}`, heading: HeadingLevel.HEADING_2 }));
            sections.push(new Paragraph({ children: [new TextRun({ text: brandNewCreativeAngle.description, italics: true })] }));
        }
        if (brandNewWelcomeStyle) {
            sections.push(new Paragraph({ text: `Welcome Style: ${brandNewWelcomeStyle.title}`, heading: HeadingLevel.HEADING_2 }));
            sections.push(new Paragraph({ children: [new TextRun({ text: brandNewWelcomeStyle.description, italics: true })] }));
        }
    }

    sections.push(new Paragraph({ text: 'Full Script', heading: HeadingLevel.HEADING_1 }));
    script.forEach((part, index) => {
        sections.push(new Paragraph({ text: `Part ${index + 1}`, heading: HeadingLevel.HEADING_2 }));
        part.split('\n').filter(line => line.trim() !== '').forEach(p => sections.push(new Paragraph({ text: p })));
    });
    
    if (groundingChunks && groundingChunks.length > 0) {
        sections.push(new Paragraph({ text: 'References', heading: HeadingLevel.HEADING_1 }));
        groundingChunks.forEach(chunk => {
            sections.push(new Paragraph({ 
                children: [new TextRun({ text: chunk.web.title, bold: true })] 
            }));
            sections.push(new Paragraph({ text: chunk.web.uri }));
        });
    }

    if (thumbnailPrompt) {
        sections.push(new Paragraph({ text: 'Thumbnail Image Prompt', heading: HeadingLevel.HEADING_1 }));
        sections.push(new Paragraph({ text: thumbnailPrompt.title, heading: HeadingLevel.HEADING_3 }));
        sections.push(new Paragraph({ text: thumbnailPrompt.prompt }));
    }
    
    sections.push(...createPromptParagraphs(initialImagePrompts, "General Image Prompts"));
    sections.push(...createPromptParagraphs(allScenePrompts, "Scene-Specific Image Prompts"));

    sections.push(new Paragraph({ text: 'Tags', heading: HeadingLevel.HEADING_1 }));
    sections.push(new Paragraph({ text: tags }));
    
    sections.push(new Paragraph({ text: 'Image Style Library', heading: HeadingLevel.HEADING_1 }));
    styles.forEach(style => {
        sections.push(new Paragraph({ text: style.name, heading: HeadingLevel.HEADING_2 }));
        sections.push(new Paragraph({ children: [new TextRun({ text: style.description, italics: true })] }));
        sections.push(new Paragraph({ children: [new TextRun({ text: "Prompt:", bold: true })] }));
        sections.push(new Paragraph({ text: style.prompt }));
    });

    const doc = new Document({
        creator: 'YT Script Generator',
        title: topic,
        sections: [{
            children: sections,
        }],
    });

    const blob = await Packer.toBlob(doc);
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'project';
    saveAs(blob, `${safeTopic}.docx`);
};
