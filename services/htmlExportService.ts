import saveAs from 'file-saver';
import type { GeneratedContent, TitledPrompt, GroundingChunk, ProjectData } from '../types';
import { styles } from './imageStyles';

const escapeHtml = (unsafe: string): string => {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

interface GroupedSources { [sourceName: string]: { hostname: string; links: { uri: string; title: string }[] } }
const getRealUrl = (uri: string): string => { try { const u = new URL(uri.startsWith('http') ? uri : `https://${uri}`); if (u.hostname.endsWith('google.com') && u.searchParams.has('url')) { const f = u.searchParams.get('url'); if (f) return decodeURIComponent(f); } } catch (e) {} return uri; };
const getCleanSourceName = (hostname: string) => { let n = hostname.replace(/^www\./, ''); const k = {'wikipedia.org': 'Wikipedia', 'britannica.com': 'Encyclopædia Britannica', 'history.com': 'History.com', 'si.edu': 'Smithsonian', 'nationalgeographic.com': 'Nat Geo'}; for(const d in k) if(n.includes(d)) return k[d as keyof typeof k]; const p = n.split('.'); const m = p.length > 1 ? p[p.length-2] : p[0]; return m.charAt(0).toUpperCase() + m.slice(1); };


const sunIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.95-4.243-1.591 1.591M5.25 12H3m4.243-4.95L6.364 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>`;
const moonIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>`;
const copyIconSvg = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"><path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z"></path><path opacity="0.4" d="M17.0998 2H12.8998C9.44976 2 8.04977 3.37 8.00977 6.75H11.0998C15.2998 6.75 17.2498 8.7 17.2498 12.9V15.99C20.6298 15.95 21.9998 14.55 21.9998 11.1V6.9C21.9998 3.4 20.5998 2 17.0998 2Z"></path></svg>`;
const checkIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

const generateInteractiveScript = () => `
    document.addEventListener('DOMContentLoaded', () => {
        // --- THEME TOGGLE ---
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        const docElement = document.documentElement;

        const applyTheme = (theme) => {
            if (theme === 'dark') {
                docElement.classList.add('dark');
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                docElement.classList.remove('dark');
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        };

        themeToggle.addEventListener('click', () => {
            const newTheme = docElement.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);

        // --- COPY BUTTONS ---
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const textToCopy = button.getAttribute('data-copy-text');
                if (!textToCopy) return;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    const copyIcon = button.querySelector('.copy-icon');
                    const checkIcon = button.querySelector('.check-icon');
                    const copyTextSpan = button.querySelector('.copy-text');
                    
                    if (!copyIcon || !checkIcon) return;

                    copyIcon.style.display = 'none';
                    checkIcon.style.display = 'inline-block';
                    if (copyTextSpan) copyTextSpan.textContent = 'Copied!';
                    button.disabled = true;

                    setTimeout(() => {
                        copyIcon.style.display = 'inline-block';
                        checkIcon.style.display = 'none';
                        if (copyTextSpan) copyTextSpan.textContent = button.getAttribute('data-original-text') || 'Copy';
                        button.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy text.');
                });
            });
        });

        // --- SCROLLSPY ---
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('.sidebar nav a');

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });

        sections.forEach(section => {
            observer.observe(section);
        });
    });
`;

const generateHtmlMarkup = (projectData: ProjectData): string => {
    const { channelName, topic, generatedContent: content } = projectData;
    if (!content) return "<h1>Error: No content to display</h1>";

    const { summary, characters, script, thumbnailPrompt, initialImagePrompts, scenePrompts, tags, groundingChunks, period, location, brandNewScriptStyle, brandNewCreativeAngle, brandNewWelcomeStyle } = content;

    const escapedTopic = escapeHtml(topic);
    const escapedChannelName = escapeHtml(channelName);
    const allScenePrompts = (scenePrompts ?? []).filter((p): p is TitledPrompt[] => Array.isArray(p)).flat();
    
    const createCopyButton = (text: string, buttonText: string = 'Copy') => {
        return `<button class="copy-btn" data-copy-text="${escapeHtml(text)}" data-original-text="${escapeHtml(buttonText)}">
            <span class="copy-icon">${copyIconSvg}</span>
            <span class="check-icon" style="display:none;">${checkIconSvg}</span>
            <span class="copy-text">${escapeHtml(buttonText)}</span>
        </button>`;
    }

    const createPromptCard = (prompt: TitledPrompt, index?: number) => `
        <div class="card"><div class="card-header"><h4>${index !== undefined ? `${index + 1}. ` : ''}${escapeHtml(prompt.title)}</h4>${createCopyButton(prompt.prompt)}</div><pre>${escapeHtml(prompt.prompt)}</pre></div>
    `;
    
    const summaryHtml = `<div class="card"><div class="card-header"><h3>Video Summary</h3>${createCopyButton(summary)}</div><pre>${escapeHtml(summary)}</pre></div>`;
    const periodHtml = period ? `<div class="card"><div class="card-header"><h3>Period</h3>${createCopyButton(period)}</div><pre>${escapeHtml(period)}</pre></div>` : '';
    const locationHtml = location ? `<div class="card"><div class="card-header"><h3>Location</h3>${createCopyButton(location)}</div><pre>${escapeHtml(location)}</pre></div>` : '';
    const charactersHtml = characters ? `<div class="card"><div class="card-header"><h3>Main Characters</h3>${createCopyButton(characters)}</div><pre>${escapeHtml(characters)}</pre></div>` : '';
    const tagsHtml = `<div class="card"><div class="card-header"><h3>YouTube Video Tags</h3>${createCopyButton(tags, 'Copy All')}</div><div class="p-6"><div class="flex flex-wrap gap-2">${tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div></div></div>`;

    let customStylesHtml = '';
    if (brandNewScriptStyle || brandNewCreativeAngle || brandNewWelcomeStyle) {
        const scriptStyleCard = brandNewScriptStyle ? `<div class="card"><div class="card-header"><h4>Script Style: ${escapeHtml(brandNewScriptStyle.title)}</h4></div><pre>${escapeHtml(brandNewScriptStyle.description)}</pre></div>` : '';
        const creativeAngleCard = brandNewCreativeAngle ? `<div class="card"><div class="card-header"><h4>Creative Angle: ${escapeHtml(brandNewCreativeAngle.title)}</h4></div><pre>${escapeHtml(brandNewCreativeAngle.description)}</pre></div>` : '';
        const welcomeStyleCard = brandNewWelcomeStyle ? `<div class="card"><div class="card-header"><h4>Welcome Style: ${escapeHtml(brandNewWelcomeStyle.title)}</h4></div><pre>${escapeHtml(brandNewWelcomeStyle.description)}</pre></div>` : '';
        customStylesHtml = `<div class="space-y-4">${scriptStyleCard}${creativeAngleCard}${welcomeStyleCard}</div>`;
    }

    const scriptPartsHtml = script.map((chunk, index) => {
        const paragraphs = chunk.split('\n').filter(line => line.trim() !== '').map(p => `<p>${escapeHtml(p)}</p>`).join('');
        return `<div class="card"><div class="card-header"><h4>Part ${index + 1}</h4>${createCopyButton(chunk)}</div><div class="script-content">${paragraphs}</div></div>`;
    }).join('');
    
    const thumbnailHtml = thumbnailPrompt ? createPromptCard(thumbnailPrompt) : '';
    const initialPromptsHtml = (initialImagePrompts ?? []).map((prompt, index) => createPromptCard(prompt, index)).join('');
    const scenePromptsHtml = allScenePrompts.map((prompt, index) => createPromptCard(prompt, index)).join('');

    let referencesHtml = '';
    if (groundingChunks && groundingChunks.length > 0) {
        const grouped = groundingChunks.reduce((acc, c) => { 
            try { 
                const r = getRealUrl(c.web.uri); 
                const u = new URL(r.startsWith('http') ? r : `https://${r}`); 
                const h = u.hostname; 
                const s = getCleanSourceName(h); 
                if (!acc[s]) acc[s] = { hostname: h, links: [] }; 
                if (!acc[s].links.some(l => l.uri === r)) acc[s].links.push({ uri: r, title: c.web.title }); 
            } catch (e) { console.error(e); } 
            return acc; 
        }, {} as GroupedSources);
        
        const sourceCards = Object.entries(grouped).map(([name, data]) => `
            <div class="card">
                <div class="card-header"><h4>${escapeHtml(name)}</h4></div>
                <div class="p-6">
                    <ul class="list-disc list-inside space-y-2">
                        ${data.links.map(l => `<li><a href="${escapeHtml(l.uri)}" target="_blank" rel="noopener noreferrer" class="reference-link">${escapeHtml(l.title)}</a></li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
        referencesHtml = `<div class="space-y-4">${sourceCards}</div>`;
    }
    
    const styleLibraryHtml = `<div class="card overflow-x-auto"><table class="style-table">
        <thead><tr><th>Style</th><th>Description</th><th>Action</th></tr></thead>
        <tbody>${styles.map(style => `
            <tr>
                <td class="font-semibold">${escapeHtml(style.name)}</td>
                <td>${escapeHtml(style.description)}</td>
                <td>${createCopyButton(style.prompt, 'Copy Style')}</td>
            </tr>
        `).join('')}</tbody>
    </table></div>`;

    const navLinks = [
        { id: 'summary', title: 'Summary' },
        period && { id: 'period', title: 'Period' },
        location && { id: 'location', title: 'Location' },
        characters && { id: 'characters', title: 'Characters' },
        customStylesHtml && { id: 'custom-style', title: 'AI Narrative' },
        { id: 'tags', title: 'Tags' },
        { id: 'script', title: 'Full Script' },
        thumbnailPrompt && { id: 'thumbnail', title: 'Thumbnail Prompt' },
        (initialImagePrompts ?? []).length > 0 && { id: 'prompts-general', title: 'General Prompts' },
        allScenePrompts.length > 0 && { id: 'prompts-scene', title: 'Scene Prompts' },
        groundingChunks && groundingChunks.length > 0 && { id: 'references', title: 'References' },
        { id: 'styles', title: 'Style Library' },
    ].filter(Boolean);

    return `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YT Script: ${escapedTopic}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root { --bg-color: #111827; --card-color: #1f2937; --text-color: #d1d5db; --text-strong-color: #f9fafb; --border-color: #374151; --accent-color: #8b5cf6; --accent-hover: #7c3aed; }
        html.light { --bg-color: #f3f4f6; --card-color: #ffffff; --text-color: #4b5563; --text-strong-color: #111827; --border-color: #e5e7eb; }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg-color); color: var(--text-color); transition: background-color 0.3s ease; }
        .dark .dark-mode-icon { display: block; } .dark-mode-icon { display: none; }
        .light .light-mode-icon { display: block; } .light-mode-icon { display: none; }
        h1, h2, h3, h4 { color: var(--text-strong-color); font-weight: 700; }
        a.reference-link { color: var(--accent-color); } a.reference-link:hover { text-decoration: underline; }
        .sidebar { position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .sidebar nav a { display: block; padding: 0.5rem 1rem; border-left: 3px solid transparent; transition: all 0.2s ease; }
        .sidebar nav a:hover { color: var(--text-strong-color); border-left-color: var(--border-color); }
        .sidebar nav a.active { color: var(--accent-color); font-weight: 600; border-left-color: var(--accent-color); }
        .card { background-color: var(--card-color); border: 1px solid var(--border-color); border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); margin-bottom: 2rem; }
        .dark .card { box-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4); }
        .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        pre, .script-content, .card .p-6 { padding: 1.5rem; white-space: pre-wrap; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; line-height: 1.6; }
        .script-content p { margin-bottom: 1em; }
        .tag { background-color: rgba(139, 92, 246, 0.1); color: var(--accent-color); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; }
        .copy-btn { display: inline-flex; align-items: center; gap: 0.5rem; background-color: transparent; color: var(--text-color); font-size: 0.875rem; font-weight: 500; padding: 0.5rem 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; transition: all 0.2s ease-in-out; cursor: pointer; }
        .copy-btn:hover:not(:disabled) { background-color: var(--border-color); color: var(--text-strong-color); }
        .copy-btn:disabled { color: #34d399; border-color: #34d399; background-color: rgba(16, 185, 129, 0.1); cursor: default; }
        .copy-btn svg { width: 1.1rem; height: 1.1rem; }
        .style-table { width: 100%; text-align: left; }
        .style-table th, .style-table td { padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--border-color); }
        .style-table th { background-color: var(--bg-color); }
        .style-table tr:last-child td { border-bottom: none; }
        @media print { body { background-color: white !important; } .no-print { display: none; } .card { box-shadow: none; border: 1px solid #ccc; } }
    </style>
    <link rel="preconnect" href="https://rsms.me/"><link rel="stylesheet" href="https://rsms.me/inter/inter.css">
</head>
<body class="dark">
    <div class="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <aside class="md:col-span-1 sidebar py-8 no-print">
             <div class="px-4 mb-6">
                <h2 class="text-xl font-bold">Project Content</h2>
                <p class="text-sm">Quick navigation</p>
             </div>
             <nav>${navLinks.map(link => `<a href="#${link.id}">${link.title}</a>`).join('')}</nav>
        </aside>
        <div class="md:col-span-3 lg:col-span-4 py-8">
            <header class="flex justify-between items-center mb-10">
                <div>
                    <h1 class="text-3xl md:text-5xl tracking-tight">${escapedTopic}</h1>
                    <p class="text-lg mt-2">For Channel: <span class="font-semibold text-gray-400 dark:text-gray-300">${escapedChannelName}</span></p>
                </div>
                <button id="theme-toggle" class="p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/10 no-print">
                    <span id="sun-icon" class="dark-mode-icon">${sunIconSvg}</span>
                    <span id="moon-icon" class="light-mode-icon">${moonIconSvg}</span>
                </button>
            </header>
            <main>
              <section id="summary">${summaryHtml}</section>
              ${period ? `<section id="period">${periodHtml}</section>`: ''}
              ${location ? `<section id="location">${locationHtml}</section>`: ''}
              ${characters ? `<section id="characters">${charactersHtml}</section>`: ''}
              ${customStylesHtml ? `<section id="custom-style"><h2 class="text-3xl font-bold mb-8">AI-Generated Narrative Style</h2>${customStylesHtml}</section>` : ''}
              <section id="tags">${tagsHtml}</section>
              <section id="script"><h2 class="text-3xl font-bold mb-8">Full Video Script</h2>${scriptPartsHtml}</section>
              ${thumbnailPrompt ? `<section id="thumbnail"><h2 class="text-3xl font-bold mb-8">Thumbnail Prompt</h2>${thumbnailHtml}</section>` : ''}
              ${(initialImagePrompts ?? []).length > 0 ? `<section id="prompts-general"><h2 class="text-3xl font-bold mb-8">General Image Prompts</h2>${initialPromptsHtml}</section>` : ''}
              ${allScenePrompts.length > 0 ? `<section id="prompts-scene"><h2 class="text-3xl font-bold mb-8">Scene-Specific Prompts</h2>${scenePromptsHtml}</section>` : ''}
              ${referencesHtml ? `<section id="references"><h2 class="text-3xl font-bold mb-8">References</h2>${referencesHtml}</section>` : ''}
              <section id="styles"><h2 class="text-3xl font-bold mb-8">Image Style Library</h2>${styleLibraryHtml}</section>
            </main>
            <footer class="text-center mt-12 text-sm"><p>Generated by AI. Please review for accuracy.</p></footer>
        </div>
    </div>
    <script>${generateInteractiveScript()}</script>
</body>
</html>`;
};

export const exportToHtml = (projectData: ProjectData): void => {
    try {
        const htmlContent = generateHtmlMarkup(projectData);
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        const safeTopic = projectData.topic.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'project';
        saveAs(blob, `${safeTopic}.html`);
    } catch(err) {
        console.error("Error creating HTML file:", err);
        throw new Error("Could not create the HTML file.");
    }
};
