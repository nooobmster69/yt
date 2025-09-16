
# The Ultimate User Manual for the Script Generator

Welcome! This application is designed as a powerful and flexible content creation engine. By understanding how to combine its settings, you can generate scripts for virtually any genre or topic, from historical epics to cutting-edge science documentaries.

## Step 1: Define Your Core Idea (The "What")

This first section is all about telling the AI **what** your video is about.

- **Video Topic:** This is the most important field. Be as specific as you can for the best results.
  - **Good:** "The history of penicillin"
  - **Better:** "The accidental discovery of penicillin by Alexander Fleming and its impact on WWII"
- **Inspire Idea Button:** If you're stuck, click this! The AI will brainstorm 5 creative video topics for you.
- **Topic Guide (Optional):** This is your secret weapon for creative control. Use it to provide the AI with specific instructions, key points to include, a desired narrative angle, or facts it must mention.
- **YouTube Channel Name:** This helps the AI tailor the welcome and outro scripts (e.g., "Welcome back to History Uncovered!").
- **Output Language:** Select the language for your script. The AI will write the entire script, summary, and tags in this language.

## Step 2: Choose Your Narrative Style (The "Feel")

This is where you become the director. These settings control the **tone, style, and voice** of your script.

- **Script Style:** This is your primary control for the script's format. Choose from `Narrative Storyteller`, `YouTuber Explainer`, `Creative Story`, `Documentary`, `Podcast` (2-host or solo), and more.
- **Creative Angle:** This injects a specific narrative flavor.
    - `Standard`: A direct, balanced storytelling approach.
    - `Fun & Witty`: Makes the script lighthearted and humorous.
    - `Plot Twist`: The AI will structure the story to build up to a shocking reveal.
    - `Outsmart`: The story will be framed as a battle of wits.
- **Story Focus:**
  - `Personal Stories`: Focuses on the journey of key characters.
  - `General History`: Gives a broad, comprehensive overview of a topic.
- **Welcome Style:** Choose the energy of your intro. `Energetic YouTuber` is great for grabbing attention, while `Calm & Immersive` is perfect for relaxing content.

## Step 3: Configure the Engine (The "How")

This section controls **how** the AI generates your script.

- **Generation Model:**
  - `Gemini 2.5 Flash`: The default choice. It's fast, cost-effective, and excellent for most tasks.
  - `Gemini 2.5 Pro`: The most powerful model. Use this for maximum quality and creativity.
- **Chapter-Driven Generation:** This is the recommended workflow.
    - **1. Outline First:** The AI generates a complete chapter outline before writing.
    - **2. Write in Batches:** The AI writes the script chapter by chapter for logical flow.
    - **3. Live Updates:** You'll see a live progress log as the script is created.
- **Extended Generation:** An alternative for long videos where the AI generates the script in continuous chunks. Best for creative, free-flowing narratives.
- **Use Google Search:** **Critical for factual content**. When enabled, the AI uses Google Search for accuracy and generates a "Sources" tab with all referenced links.
- **Total Story Duration:** Set the final target length for your video script.
- **Part Duration:** This slider controls how the final script is split into manageable "parts" in the script viewer. It does not affect the total length of the generated content.

## Step 4: Generating and Using Your Content

Once you click **"Generate Project,"** the results appear in the main content area, organized into several powerful tabs:

- **Script Tab:**
  - Read your script, divided into parts.
  - **Director Mode:** If enabled, you'll see `[CUE:X]` markers. These link to AI-generated image prompts below, creating a perfect shot list.
  - **Generate SSML:** Create professional-grade Speech Synthesis Markup Language for realistic text-to-speech voice-overs.
- **Visuals Tab:** This is your art department!
  - **Thumbnail Concepts:** Get AI suggestions for viral thumbnail designs.
  - **Interactive Thumbnail Builder**: A visual, drag-and-drop canvas where you can arrange placeholders. The app then translates your layout into a detailed AI image prompt.
  - **Image Style Library:** A rich, searchable library of visual styles (e.g., "Gritty Comic," "Ultra-Real Cinematic"). You can edit any style's prompt.
  - **Image Prompt Studio:** Combine your script's scenes with styles from the library to create perfect, ready-to-use prompts for any image generator.
  - **In-App Image Generation:** Generate images directly from your prompts and even make AI-powered adjustments.
- **Post-Production Tab:**
  - **YouTube Chapters:** Automatically generate timestamped chapters. Just copy and paste them into your YouTube description.
  - **Editing Timeline:** Get an AI-generated timeline with suggestions for visuals, text overlays, and music cues to guide your video edit.
- **Sources Tab:** (Appears only when "Use Google Search" is on) See all the websites the AI referenced, complete with links for easy fact-checking.

## Step 5: Save, Load, and Export

- **Save Project:** Click the Save icon in the header to download a single `.json` file containing all your settings and generated content.
- **Load Project:** Click the Load icon to upload a previously saved project file and continue right where you left off.
- **Presets**: Use the presets in the form to quickly apply settings for common video types like a "Deep Dive Science Doc" or "Creative Fictional Story".
- **Export:** Use the Word or HTML icons to export your full project into a clean, portable document for offline use or sharing.
- **Edit Mode**: Toggle this on to directly edit any AI-generated text field, from the summary to individual image prompts.

---

### Pro Recipe: Creating a High-Quality Science Video

To generate a top-tier health or science script, try these settings:

- **Core Idea:**
  - **Topic:** "The vital role of the gut microbiome in human health."
  - **Topic Guide:** "Explain the difference between good and bad bacteria. Mention the importance of probiotics and prebiotics. Discuss the gut-brain axis."
- **Engine & Output:**
  - **Generation Model:** `Gemini 2.5 Pro` (for high-quality scientific explanation).
  - **Chapter-Driven Generation:** `On` (to ensure a logical flow).
  - **Use Google Search:** `On` (for factual accuracy and sources).
- **Narrative Style:**
  - **Script Style:** `Documentary`
  - **Story Focus:** `General`
  - **Welcome Style**: `Direct to Camera` (to establish authority).

Click **"Generate Project,"** and you will get a well-structured, fact-checked, and engaging script, complete with sources, perfectly tailored for a science channel. Happy creating!
