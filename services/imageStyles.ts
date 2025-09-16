


export interface Style {
    name: string;
    description:string;
    prompt: string;
    thumbnail?: string;
    category: string;
    isCustomized?: boolean;
}

export const styles: Style[] = [
    {
        name: "Gritty Historical Comic",
        description: "Dark, memorable style with exaggerated features and a vintage, grainy texture. Perfect for grabbing attention.",
        prompt: "Masterpiece in the gritty, atmospheric comic art style of Mike Mignola and Frank Miller. Dynamic medium shot or atmospheric wide shot. Hyper-detailed, employing extreme chiaroscuro with oppressive, absolute blacks swallowing the scene. Harsh, high-contrast cel-shading carves out figures. The entire image is layered with a noticeable grainy, aged newsprint texture. Characters are stylized and angular, captured in medium or long shots to emphasize their place within the oppressive environment; avoid close-ups. A muted, desaturated, earthy color palette is strictly enforced, with occasional, shocking splashes of a single accent color (e.g., blood red). The line work is paramount: thick, bold, expressive black ink outlines define everything. Heavy atmospheric effects like thick fog, driving rain, or swirling dust. Composition feels like a dramatic comic book panel.",
        thumbnail: "https://i.imgur.com/Hg0O4Rm.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Ultra-Real Cinematic",
        description: "A photorealistic masterpiece, indistinguishable from a high-resolution photo. For maximum realism and detail.",
        prompt: "Masterpiece, 8k, ultra-photorealistic cinematic film still. Shot on 70mm film, professional color grading with a subtle teal-and-orange palette. Insanely detailed, hyper-realistic textures. Shallow depth of field with beautiful bokeh. Naturalistic, dramatic lighting (golden hour or volumetric). Subject is captured in a candid, natural moment. Subtle lens flare, fine film grain. Professional photography, sharp focus, ARRI Alexa, Cooke S7/i anamorphic lenses.",
        thumbnail: "https://i.imgur.com/9guGkFS.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Epic Cinematic Lighting",
        description: "Focuses entirely on creating dramatic, emotional lighting with deep shadows and glowing highlights, like a blockbuster film.",
        prompt: "Masterpiece, dramatic cinematic lighting. A scene defined by extreme chiaroscuro and tenebrism, with deep, crushing blacks and brilliant, sculptural highlights. Volumetric lighting, god rays filtering through atmospheric haze or dust. Motivated light sources cast long, dramatic shadows. Backlighting carves the subject out from the background. The mood is intense, emotional, and epic. Professional color grading, hyper-realistic textures, 8k.",
        thumbnail: "https://i.imgur.com/5u6cTzJ.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Ghibli-esque Watercolor",
        description: "A beautiful, nostalgic style reminiscent of hand-painted anime stills. Great for wonder and emotion.",
        prompt: "A masterpiece illustration in the timeless, nostalgic style of a Studio Ghibli film still by Hayao Miyazaki and Kazuo Oga. A breathtakingly detailed, hand-painted watercolor aesthetic, featuring soft, feathery edges and visible watercolor paper texture. The background is a lush, impossibly detailed environment, a character in its own right. The lighting is magical and warm, with crepuscular 'god rays' filtering through clouds or leaves, making the air itself seem to glow. A vibrant yet harmonious color palette with rich greens and cerulean blues. Charming, expressive characters with soft features, often seen from a distance or as part of a sweeping landscape. The composition is a cinematic wide shot or a magical establishing shot, creating a sense of wonder and scale. Focus on the feeling of a gentle breeze and the quiet magic of a single moment.",
        thumbnail: "https://i.imgur.com/hQYxDc9.jpeg",
        category: "Core Artistic Styles"
    },
    {
        name: "Realistic Egyptian Wall Art",
        description: "A realistic photograph of ancient paintings or carvings on a weathered stone wall, with dramatic lighting. Captures different camera angles.",
        prompt: "An ultra-realistic, high-resolution archaeological photograph of an Ancient Egyptian wall painting or bas-relief. The scene is rendered on a heavily weathered, rough-hewn limestone or sandstone surface inside a dimly lit tomb. The lighting is highly dramatic, a single, low-angle directional light source (imitating a torch or an archaeologist's lamp) casts long, raking shadows that accentuate every ancient chisel mark, crack, and area of peeling plaster. The original pigments (red ochre, lapis lazuli) are severely faded and flaked. The camera is positioned at an oblique angle, creating a dynamic perspective and a sense of discovery. The air is thick with dust motes visible in the light beam. This is a scientific, documentary-style photograph capturing the raw, untouched state of the artifact.",
        thumbnail: "https://i.imgur.com/FreUHxZ.png",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Ancient Egyptian Papyrus",
        description: "Iconic style of Ancient Egypt. Features hieroglyphs, side-profiles, and a distinct color palette on textured papyrus.",
        prompt: "A museum-quality, high-resolution scan of an authentic Ancient Egyptian papyrus painting (from the Book of the Dead). The image showcases the fibrous, textured surface of genuine, aged papyrus, complete with stains, creases, and frayed, torn edges. All figures must adhere strictly to the composite view: head in profile, frontal eye, frontal torso, profile limbs. The color palette is strictly limited to authentic mineral pigments: red ochre, yellow ochre, carbon black, and Egyptian blue, with visible fading. Every element is defined by confident, clear black ink outlines. The scene is meticulously arranged in horizontal registers, separated by solid lines, and integrated with columns of legible hieroglyphs. The overall feel is that of a priceless, fragile artifact.",
        thumbnail: "https://i.imgur.com/ZjzHdg5.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Greco-Roman Fresco",
        description: "The realistic wall paintings of Pompeii. A snapshot of daily life with naturalism and depth.",
        prompt: "A photograph of a preserved Greco-Roman fresco from a villa in Pompeii. The image captures the unique 'buon fresco' technique on damp plaster, resulting in a matte, chalky surface. The wall shows significant aging: a network of fine cracks (craquelure), and large areas of chipped plaster revealing the rough wall beneath. Figures are realistic and naturalistic, often depicted in daily life scenes or mythological tableaus from a medium distance, demonstrating an understanding of anatomy, volume, and movement. The color palette is rich and earthy, dominated by iconic Pompeian red, yellow ochre, and verdant greens. The scene employs atmospheric perspective and foreshortening to create a convincing illusion of depth.",
        thumbnail: "https://i.imgur.com/BVhmNN7.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Prehistoric Cave Art",
        description: "Primal and powerful art from deep within ancient caves. Uses simple earth pigments on a rough rock surface.",
        prompt: "A photograph of prehistoric cave art, captured deep within a cavern like Lascaux. The lighting is from a single, flickering torch held just out of frame, casting dynamic, dancing shadows across the rough, undulating, and damp limestone walls. The art is painted using the natural contours of the rock to suggest form and movement. The color palette is strictly limited to primitive earth pigments: red and yellow ochre, manganese dioxide for black. The figures (animals, human hands) are symbolic and energetic. The focus is on the raw texture of the rock and the primal, spiritual atmosphere of the sacred space.",
        thumbnail: "https://i.imgur.com/gW4gDb5.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Byzantine Mosaic Icon",
        description: "The divine and ethereal style of Byzantine mosaics, featuring golden backgrounds and a sense of spiritual stillness.",
        prompt: "A masterpiece Byzantine mosaic, as if from the Hagia Sophia. The entire image is meticulously composed of thousands of individual, small glass and stone tiles (tesserae), set at slight angles to catch and reflect light. Grout lines are visible. The background is a sea of shimmering, reflective gold leaf tesserae, creating a divine, non-naturalistic space. Figures are elongated, ethereal, and majestic, depicted frontally with large, solemn, almond-shaped eyes that gaze into eternity. The color palette is rich and symbolic, using deep blues, regal purples, and crimsons. The lighting is ambient and diffuse, causing the gold to glitter and the glass to glow from within.",
        thumbnail: "https://i.imgur.com/zkPcX7c.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Gothic Stained Glass",
        description: "The luminous art of Gothic cathedrals. Bold black lines separate vibrant, jewel-toned pieces of glass.",
        prompt: "A scene depicted as a soaring Gothic stained glass window from Chartres Cathedral. The image is constructed from hundreds of pieces of vibrant, jewel-toned glass (cobalt blue, ruby red, emerald green), each piece showing imperfections like air bubbles. Thick, black, heavily corroded lead lines (cames) bind the glass pieces, forming the outlines of the design. Figures are elegant, elongated, and stylized. The lighting is crucial: brilliant, divine sunlight shines *through* the window from behind, causing the colors to glow intensely and cast ethereal, colored light into the cathedral's interior. The composition is a complex narrative with multiple scenes arranged within a larger architectural frame.",
        thumbnail: "https://i.imgur.com/6Bt97Wr.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Renaissance Oil Painting",
        description: "The dawn of modern realism. Dramatic lighting (chiaroscuro), deep perspective, and lifelike human figures.",
        prompt: "A masterpiece High Renaissance oil painting in the style of Leonardo da Vinci. An ultra-high-resolution scan of an oil-on-panel painting, showing subtle canvas texture and a delicate network of age-related craquelure. Masterful use of anatomical precision. The scene is bathed in a soft, atmospheric haze using the 'sfumato' technique. Lighting is a subtle, masterful chiaroscuro, modeling figures with gentle light and shadow. The composition is a balanced tableau or a medium shot, depicting historical or religious scenes, avoiding tight portraits. The overall mood is serene, intellectual, and mysterious.",
        thumbnail: "https://i.imgur.com/w8303Tl.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Baroque Oil Painting",
        description: "The dramatic, emotional, and intense style of masters like Caravaggio. High-contrast lighting and powerful compositions.",
        prompt: "A masterpiece Baroque oil painting in the dramatic style of Caravaggio. The scene is dominated by intense 'tenebrism'—a profound darkness from which figures emerge dramatically. A single, harsh, theatrical light source from a high, unseen point rakes across the scene. The composition is a dynamic tableau, built on powerful diagonal lines, showing the full context of the action. Avoid isolated portraits. Figures are rendered with intense realism, captured in the midst of a dramatic moment within a larger scene. The painting feels visceral, immediate, and intensely human.",
        thumbnail: "https://i.imgur.com/tEPkYxz.jpeg",
        category: "Core Artistic Styles"
    },
    {
        name: "Baroque Harbor Embarkation",
        description: "A grand, cinematic Baroque painting of a bustling 17th-century harbor scene, full of courtly figures, sailors, and rich details.",
        prompt: "Baroque oil painting, wide cinematic 16:9 composition of a 17th‑century European harbor embarkation on the deck of a tall ship. Foreground: a courtly man in a bright red coat bows and takes the hand of a young woman in a pink-and-white gown with lace sleeves as she steps onto a patterned carpet; a small spaniel dog stands on the carpet. To the right, a stern nobleman in a dark blue coat and tricorne hat holds a cane while a courtier in a purple coat reads from a paper. Around them are sailors and attendants, women with fans and feathered hair, ropes and rigging. Background: calm sea with rowboats, windmills and a fortified town with gabled roofs and spires under a cloudy sky. Soft daylight, warm palette (crimson, rose, cream, navy), painterly brushstrokes, ornate textures, periwigs, realistic proportions, oil-on-canvas look with subtle varnish. Exclude: modern objects, text, watermarks, extra limbs, distortions.",
        thumbnail: "https://i.imgur.com/vlW55ad.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Impressionist Oil Painting",
        description: "Capturing a fleeting moment with visible brushstrokes and a focus on light and atmosphere, like Monet.",
        prompt: "An Impressionist oil painting in the style of Claude Monet, capturing the fleeting essence of a moment 'en plein air'. The canvas is alive with visible, short, thick, unblended brushstrokes (impasto). The primary subject is the ephemeral quality of natural light and its changing effects on color and atmosphere. Shadows are not black but are filled with complementary colors. The composition is open and candid, like a snapshot of everyday life, often capturing figures within a landscape or cityscape from a medium distance. Precise details dissolve into a haze of color.",
        thumbnail: "https://i.imgur.com/DnsW9xi.jpeg",
        category: "Core Artistic Styles"
    },
    {
        name: "Pointillism Painting",
        description: "A dreamy, almost digital look created from thousands of tiny, distinct dots of color. Emulates masters like Seurat.",
        prompt: "A masterpiece of Neo-Impressionism in the Pointillist style of Georges Seurat. The entire image is meticulously constructed from countless tiny, distinct dots of pure, unmixed color. All colors are mixed optically by the viewer's eye, creating a uniquely luminous, shimmering effect. The composition is highly ordered and formal, with figures arranged in statuesque poses within a larger landscape or social scene, such as a park or riverside. The overall effect is both dreamlike and rigorously structured.",
        thumbnail: "https://i.imgur.com/av4Vlkh.jpeg",
        category: "Core Artistic Styles"
    },
    {
        name: "Art Nouveau Poster",
        description: "Elegant, decorative, and ornate, with flowing, organic lines inspired by nature. For mystical or romanticized history.",
        prompt: "An ornate Art Nouveau poster in the style of Alphonse Mucha, designed as a stone lithograph from the Belle Époque. The composition is dominated by long, sinuous, asymmetrical, and organic 'whiplash' lines. The central figure is presented in full or three-quarter length, integrated with decorative elements, not as a tight portrait, surrounded by a halo of intricate, stylized natural forms like flowers and vines. Typography, illustration, and decorative borders are seamlessly integrated. The color palette is soft, sensual, and harmonious, with delicate pastels and rich golds. The feeling is one of decorative elegance and romanticism.",
        thumbnail: "https://i.imgur.com/f6XyZDU.jpeg",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Art Deco Illustration",
        description: "Sleek, geometric, and luxurious. Strong lines, streamlined forms, and a feeling of modernity from the 1920s-30s.",
        prompt: "A lavish Art Deco illustration from the Jazz Age (1920s-30s). The design is defined by sleek, streamlined, and symmetrical geometry: bold sunburst motifs, chevrons, and strong vertical lines that evoke the machine age. Often depicts scenes of modern life, travel, or industry in dynamic, wide compositions. Forms are simplified and stylized, with strong, clean outlines. The image exudes luxury, glamour, and a forward-looking dynamism. The color palette is sophisticated and high-contrast, often featuring deep blacks, rich creams, and dazzling metallic accents of gold, silver, and chrome.",
        thumbnail: "https://i.imgur.com/IPmvmJM.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Soviet Propaganda Poster",
        description: "A bold, graphic, and ideological style with strong diagonal lines and a limited color palette (red, black, beige).",
        prompt: "A masterpiece of Russian Constructivist graphic design, in the style of a 1920s Soviet poster by Rodchenko. The image is a dynamic, abstract collage combining graphic elements, stark typography, and photomontage. The composition is built on powerful, disruptive diagonal axes. A strictly limited color palette of revolutionary red, oppressive black, and stark off-white/beige. Figures are symbolic and heroic, often shown in action or as part of a larger collective, not as individuals in close-up. Bold, geometric, sans-serif Cyrillic typography is a primary design element. The overall feel is modern, utilitarian, and politically charged.",
        thumbnail: "https://i.imgur.com/z6qYRHg.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "American Folk Art",
        description: "A naive, charming, and simplified style, often depicting rural life with a flat perspective.",
        prompt: "A scene in the naive, charming 'primitive' style of American Folk Art, reminiscent of Grandma Moses. The painting intentionally rejects academic rules, featuring a flattened perspective where there is no realistic sense of depth. Figures and objects are simplified and stylized. The color palette is bold, solid, and often bright. The composition is often a bird's-eye view of a bustling rural community scene (a farm, a village festival). The mood is sincere, nostalgic, and tells a clear story of daily life.",
        thumbnail: "https://i.imgur.com/laaKRcW.png",
        category: "Historical & Cultural Styles"
    },
    {
        name: "19th-Century History Painting",
        description: "Grand, theatrical, romanticized style. Emulates a scan of a physical oil painting on canvas.",
        prompt: "A monumental 19th-century academic history painting in the grand, theatrical style of Delacroix or Gérôme. This is a high-resolution scan of a massive oil on canvas, showing fine canvas texture. The composition is a grand tableau, a wide shot capturing the scale of a historical or mythological event. Avoid single-figure portraits. The scene is crowded with idealized yet lifelike figures in heroic or tragic poses, arranged for maximum narrative clarity and emotional impact. The lighting is dramatic and emotional, a sophisticated chiaroscuro that highlights key moments and heightens the theatricality.",
        thumbnail: "https://i.imgur.com/7qtFB4X.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Digital Mixed Media",
        description: "Modern, stylized look blending 2D painted textures with clean, 3D character models, like 'Arcane'.",
        prompt: "A masterpiece of stylized mixed media, blending 2D and 3D digital art in the groundbreaking style of the series 'Arcane'. 3D character models are cel-shaded with clean lines. These models are placed within breathtakingly detailed and atmospheric 2D backgrounds that are richly textured with visible, painterly brushstrokes. The lighting is complex and cinematic, seamlessly integrating the 3D characters into the 2D world. The aesthetic is a perfect fusion of graphic character art and fine art environmental painting, ideal for establishing shots and dynamic mid-shots.",
        thumbnail: "https://i.imgur.com/Lk2Cj4f.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Comic Halftone Animation",
        description: "Dynamic, modern 3D animation style with 2D comic book effects like halftone dots and ink lines.",
        prompt: "A dynamic still from a 3D animation in the groundbreaking style of 'Spider-Man: Into the Spider-Verse'. The image intentionally breaks the 3D mold by incorporating 2D comic book language. Shading is not smooth but is rendered with visible Ben-Day dots and halftone patterns. To simulate a misaligned print, there is slight chromatic aberration. Fluid, expressive 3D character models are augmented with hand-drawn 2D effects like action lines and impact flashes. The composition is bold and graphic, using forced perspective and panel-like framing to mimic a comic book page.",
        thumbnail: "https://i.imgur.com/VuS3BO7.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Ancient Stone Bas-Relief",
        description: "The look of an ancient, weathered stone relief carving on a temple wall, with intricate details.",
        prompt: "A photograph of an ancient bas-relief carving, as if on the walls of an Assyrian palace or Roman triumphal arch. The scene is carved with shallow depth into a massive, weathered stone surface (sandstone or granite), revealing its rough texture and erosion. The lighting is critical: dramatic, low-angle raking sunlight from one side that casts deep, defining shadows, making the carved details pop from the surface. The figures are intricately detailed, powerful, and remain physically attached to the flat background plane, telling a narrative in sequence.",
        thumbnail: "https://i.imgur.com/EM9wbH9.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Illuminated Manuscript",
        description: "Highly detailed, ornate style from medieval manuscripts, with vibrant colors and gold leaf accents.",
        prompt: "A page from a priceless medieval illuminated manuscript. The image is a masterpiece of detail and devotion, featuring an ornate, decorated border filled with intricate Celtic knotwork, spiraling patterns, and stylized zoomorphic forms. The color palette is vibrant and jewel-like, using precious pigments like lapis lazuli, alongside prominent, shimmering, raised gold leaf that catches the light. The perspective is flat and non-naturalistic. Figures are stylized, expressive, and gracefully integrated into the overall decorative scheme of the page, often accompanied by elegant calligraphy.",
        thumbnail: "https://i.imgur.com/tud7hOa.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Medieval Panel Painting",
        description: "Early European panel painting style. Stylized figures, egg tempera, and gold leaf backgrounds.",
        prompt: "A late medieval or early Renaissance panel painting in the style of Giotto di Bondone. The image is painted with egg tempera on a gessoed wooden panel, exhibiting a fine network of craquelure. Figures are solid, sculptural, and weighty, with a new sense of three-dimensionality and emotional gravity. The perspective is shallow and stage-like, with simplified architectural elements defining the space. The background is often a flat, punched gold leaf, signifying a divine setting. The composition is clear, ordered, and narrative-driven.",
        thumbnail: "https://i.imgur.com/2JcJOqC.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Ancient Wall Macro",
        description: "An extreme close-up of a weathered ancient painting, focusing on texture and cracked, faded pigments.",
        prompt: "An extreme macro photograph of a fragment of an ancient painted wall. The focus is entirely on the raw texture of a heavily weathered surface—crumbling Roman fresco or peeling Egyptian tomb painting. The image reveals immense detail: a deep network of cracks (craquelure), microscopic chips, and the crystalline structure of faded, earthy mineral pigments. The lighting is a sharp, raking light that casts long shadows across the topography of the surface, highlighting every imperfection. The resulting image is an abstract, textural study of age and decay.",
        thumbnail: "https://i.imgur.com/2EQvqXP.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Archival B&W Photo",
        description: "A classic, grainy black and white photograph, evoking historical authenticity and journalistic documentation.",
        prompt: "An authentic archival silver gelatin print in the style of a master 20th-century photojournalist like Robert Capa. The image is high-contrast black and white, with a beautiful, naturalistic film grain from Kodak Tri-X 400 film. The composition is impeccable, capturing a 'decisive moment' of peak action or emotion. The focus is on capturing a complete scene or event, not formal portraits. The mood is one of historical authenticity and candid documentation.",
        thumbnail: "https://i.imgur.com/x8Vervr.png",
        category: "Aged & Textured Styles"
    },
    {
        name: "Damaged Film Photo",
        description: "Simulates an old, poorly preserved film photograph with scratches, dust, and light leaks for an aged feel.",
        prompt: "An authentic-looking vintage photograph from a damaged and poorly stored roll of 1970s 35mm film, capturing a candid moment or a wide landscape, never a posed studio portrait. The image is plagued by visible imperfections: heavy scratches, dust specks, chemical stains, and prominent orange or red light leaks. The colors are heavily faded and have shifted towards a magenta or yellow cast. The film grain is heavy and coarse. The focus is slightly soft. The overall aesthetic is one of a forgotten, found photograph.",
        thumbnail: "https://i.imgur.com/MXQscKW.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Modern Documentary Still",
        description: "A clean, crisp, high-resolution still from a modern documentary. Natural lighting and a candid feel.",
        prompt: "A photorealistic still from a modern BBC or Netflix documentary. Shot on a high-end cinema camera (e.g., RED Dragon) with a prime lens. Extremely detailed, clean, and crisp image. The lighting is soft, natural, and motivated, creating authenticity. The subject is framed within their environment to tell a story. Subtle, professional color grading. The mood is intimate, respectful, and candid. Sharp focus, natural textures.",
        thumbnail: "https://i.imgur.com/jqkfrSa.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Ancient Greek Pottery",
        description: "The iconic black-figure or red-figure style on ancient Greek vases. Stylized figures and geometric patterns on a terracotta background.",
        prompt: "A scene depicted on an Attic red-figure or black-figure kylix or amphora. The image is a photograph of the pottery, showing the curvature of the vessel and the slight sheen of the black slip glaze. Figures are highly stylized with strong profiles and intricate drapery. The scene adheres to the strict conventions of Greek vase painting. The color palette is absolutely limited to terracotta orange/red, glossy black, and occasional touches of white. The narrative scene is framed by intricate geometric patterns like meanders (Greek keys) or palmettes.",
        thumbnail: "https://i.imgur.com/uwkZ75j.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Ukiyo-e Woodblock Print",
        description: "The classic style of Japanese woodblock prints from the Edo period, with flowing lines and flat areas of color.",
        prompt: "A masterpiece Japanese Ukiyo-e woodblock print in the style of Hokusai or Hiroshige. The image is characterized by bold, flowing, calligraphic black outlines and flat areas of harmonious, subtly graded color. The print shows the delicate texture of handmade washi paper. The composition is masterfully asymmetrical, using negative space effectively. The scene captures an atmospheric, transient moment from 'the floating world'—a sweeping landscape, a full-figure depiction of a character in a scene, or a moment from a kabuki play. The mood is elegant and deeply rooted in Japanese aesthetics.",
        thumbnail: "https://i.imgur.com/CTZpMoJ.jpeg",
        category: "Japanese Art Styles"
    },
    {
        name: "Viking Runic Carving",
        description: "The intricate, knotwork style of carvings on ancient runestones from the Viking Age.",
        prompt: "A photograph of a Viking-era runestone carving, located in a misty Scandinavian landscape. The entire design is composed of intricate, flowing, and ribbon-like zoomorphic and knotwork patterns, in the Jelling or Ringerike style. The scene is deeply carved into a massive, weathered grey granite boulder, which is covered in patches of vibrant green and orange lichen. The incised lines of the carving are painted with a traditional Falun red ochre to make them stand out. The image captures the raw, powerful, and mysterious feel of Norse art.",
        thumbnail: "https://i.imgur.com/JCPAFHi.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Aged Manuscript / Scroll",
        description: "Old drawing on brittle, yellowed paper or parchment with worn lines, stains, and frayed edges.",
        prompt: "A fragile, yellowed page from an ancient manuscript or scroll, exhibiting pencil or ink lines that are partially worn away. The surface is textured with visible smudges, water stains, and small tears along frayed and curling edges. The script or drawing is barely readable, with details partially lost or obscured due to degradation, creating a convincingly ancient artifact.",
        thumbnail: "https://i.imgur.com/CLAtgQf.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Ancient Mural Style",
        description: "Aged mural on weathered stone. Faded pigments, cracks, and moss.",
        prompt: "An aged mural painted onto stone walls, significantly weathered and eroded textures with faded earthy pigments. Clearly visible cracks, peeling layers, water stains, and patches of moss or lichen growth. Scene details partially obscured by time and natural decay, appearing genuinely ancient and weathered.",
        thumbnail: "https://i.imgur.com/XAn6K79.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Vintage Sepia Photograph",
        description: "Antique photo in warm sepia tones with grainy textures and soft edges.",
        prompt: "An antique photograph rendered in warm sepia tones with soft, grainy textures and blurred or softly faded edges, capturing scenes of daily life, landscapes, or group activities. Avoid studio-style close-up portraits. Imperfect, dim lighting, faint scratches, and subtle stains create a convincingly vintage photographic appearance.",
        thumbnail: "https://i.imgur.com/laBakUc.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Aged Fresco Painting",
        description: "Aged fresco with faded earth-tones on a cracked plaster wall.",
        prompt: "An aged fresco painting with pastel or earth-tone pigments, painted onto cracked plaster walls. Colors faded and unevenly eroded, surface showing distinct cracks, patches of plaster loss, damp spots, and discoloration. Scene gently blurred by exposure and natural wear, giving an authentic ancient appearance.",
        thumbnail: "https://i.imgur.com/VFDlNDy.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Burnt and Damaged Image",
        description: "A photograph with soot-darkened edges, holes, and smoke stains.",
        prompt: "A damaged, burned photograph displaying soot-darkened edges, irregular holes, and smoke stains obscuring parts of the image. Unevenly faded and discolored visuals, blurred details, and textures suggestive of heat exposure and fire damage. Natural irregularities enhance realism and aged authenticity.",
        thumbnail: "https://i.imgur.com/LuRcxLX.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Old Polaroid Style",
        description: "Vintage Polaroid with faded colors, grain, and light imperfections.",
        prompt: "A vintage Polaroid-style photograph with faded, washed-out colors and grainy textures. It captures a candid, fleeting moment in time, often a medium shot of people interacting or a wide shot of a location. Image shows subtle fingerprints, stains, and light leaks typical of genuine old instant photos.",
        thumbnail: "https://i.imgur.com/XsXBuzX.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Worn Canvas Painting",
        description: "Antique canvas with visible weave, cracked paint, and faded colors.",
        prompt: "An antique canvas painting exhibiting visible canvas weave, aged oil or acrylic paint pigments with prominent cracking, subtle peeling, and flaking paint. Surface faded, gently blurred details due to pigment deterioration, slight discoloration, and aged varnish giving it an authentic antique feel.",
        thumbnail: "https://i.imgur.com/Ip1PvNi.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Old Newspaper Print",
        description: "Aged newsprint with grainy halftone dots and ink smudges.",
        prompt: "An aged newspaper print rendered in grainy black-and-white halftone dots on yellowed, fragile paper. Clearly visible ink smudges, fading of text and images, unevenly blurred details, watermarks, wrinkles, and natural wear and tear typical of genuine, aged newsprint materials.",
        thumbnail: "https://i.imgur.com/zDJPoJj.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Aged Wood Carving or Etching",
        description: "Worn wood carving with cracks, fading, and weather erosion.",
        prompt: "An aged wood-carving or etched artwork, clearly exhibiting rough, worn textures and erosion due to weather and time. Wood surface deeply cracked, slightly warped, faded pigment or natural wood discoloration present, partially obscured carving details reflecting genuine age and exposure to elements.",
        thumbnail: "https://i.imgur.com/QVw5Xwc.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Film Negative or Slide Deterioration",
        description: "Old film negative showing chemical discoloration and surface damage.",
        prompt: "An old photographic film negative or slide, displaying chemical discoloration, color shifts to magenta, cyan, or yellow tones, uneven exposure, and blurred details. Surface damage includes visible scratches, dust, mildew stains, moisture-induced spots, and subtle irregularities authentic to naturally aged photographic materials.",
        thumbnail: "https://i.imgur.com/5l4Q81F.jpeg",
        category: "Aged & Textured Styles"
    },
    {
        name: "Aztec Codex Illustration",
        description: "Bright, flat colors and stylized figures in the tradition of pre-Columbian Aztec codices, with glyphs and symbolic design.",
        prompt: "An illustration inspired by a pre-Columbian Aztec codex. Flat, vibrant mineral pigments are used, with stylized, geometric human and animal figures, glyphs, and symbolic scenes. Details are outlined with dark lines, arranged in registers or panels. The background mimics ancient amate paper texture. Ensure historical accuracy, flatness, and bold color.",
        thumbnail: "https://i.imgur.com/T9WbBEh.png",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Native American Ledger Art",
        description: "Historic Plains Indian art style using colored pencil or ink on lined ledger paper, with dynamic action scenes.",
        prompt: "A scene in the style of Native American Plains ledger art. Figures and horses are outlined in black ink or pencil and filled with bold, flat colors, drawn on lined or grid ledger paper. The composition is dynamic and narrative-driven, often depicting battle or ceremonial scenes. The paper’s texture and old writing or numbers remain visible. Ensure authenticity and narrative clarity.",
        thumbnail: "https://i.imgur.com/D8P1ch8.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Tibetan Thangka Painting",
        description: "Sacred, highly detailed Buddhist thangka with vibrant mineral pigments and symmetrical mandala or deity compositions.",
        prompt: "A sacred Tibetan thangka painting rendered in vibrant mineral pigments (lapis, vermilion, gold) on fabric. The composition is meticulously symmetrical, centered around a Buddha, bodhisattva, or wrathful deity surrounded by mandalas, clouds, lotus petals, and auspicious symbols. Borders are richly ornamented, and every detail is precise and spiritual. Ensure intricate linework and vibrant, sacred color.",
        thumbnail: "https://i.imgur.com/S5RiNrE.png",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Aboriginal Dot Painting",
        description: "Vibrant, symbolic dot patterns and earthy colors, expressing Dreamtime stories and natural forms from Indigenous Australian art.",
        prompt: "An Aboriginal dot painting with intricate patterns and symbolic forms created entirely from thousands of small dots. Earthy pigments (ochre, white, red, yellow, black) form winding lines, concentric circles, animal tracks, and abstracted landscapes. The style is vibrant, rhythmic, and deeply spiritual. Ensure cultural sensitivity and textural richness.",
        thumbnail: "https://i.imgur.com/pRaBopE.jpeg",
        category: "Historical & Cultural Styles"
    },
    {
        name: "African Kente Textile",
        description: "Vivid, geometric weaving patterns inspired by traditional Ghanaian Kente cloth. Bold colors and symbolic design.",
        prompt: "A digital textile pattern in the style of Ghanaian Kente cloth. The design is built from bold, geometric shapes and stripes in vivid colors (gold, green, red, blue, black), each color and pattern holding cultural symbolism. The weave texture is visible and patterns are repetitive and harmonious. Ensure clarity, color richness, and textile authenticity.",
        thumbnail: "https://i.imgur.com/quRGLyj.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Mesoamerican Mayan Relief",
        description: "Stone or stucco Mayan relief carvings with elaborate glyphs, rulers, and gods, showing rich detail and aged surfaces.",
        prompt: "A realistic depiction of a Mayan bas-relief panel, showing rulers or gods in elaborate costume surrounded by glyphs. Carving is shallow and highly detailed, with eroded, chipped stone or stucco surfaces. Lighting is dramatic to enhance relief depth and shadow. Ensure ancient material textures and cultural accuracy.",
        thumbnail: "https://i.imgur.com/1DNOKb3.png",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Tolkien-Style Fantasy Map",
        description: "Hand-drawn parchment map with ornate compass roses, mountain ranges, and decorated borders, reminiscent of classic high fantasy.",
        prompt: "A hand-drawn fantasy map in the style of Tolkien’s Middle-earth maps. Features include intricate mountain ranges, stylized forests, rivers, decorative banners, compass roses, sea monsters, and ornate borders. Drawn in black or brown ink on aged, yellowed parchment with faded labeling. Ensure historical map charm and fine illustrative detail.",
        thumbnail: "https://i.imgur.com/xJZHVpA.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Isometric Game Illustration",
        description: "Colorful, highly detailed isometric world or city, inspired by modern strategy or simulation games.",
        prompt: "A digital isometric illustration of a vibrant, miniature city, landscape, or dungeon. Elements are rendered with clean lines, bright colors, and visible grid-based angles. Details like tiny vehicles, trees, and buildings are included for visual richness. The style is playful, organized, and immediately readable from an angled bird’s-eye perspective. Ensure sharpness, color harmony, and rich micro-details.",
        thumbnail: "https://i.imgur.com/bv2EgPG.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Brutalist Architecture Photo",
        description: "Moody, high-contrast photo of monumental concrete architecture with dramatic light and shadow.",
        prompt: "A high-resolution photograph of a Brutalist building. The image is defined by raw, unfinished concrete, massive geometric forms, and stark, monolithic structures. Dramatic lighting creates deep shadows, emphasizing harsh lines and textures. The mood is austere, powerful, and modernist. Ensure rich material detail and bold architectural forms.",
        thumbnail: "https://i.imgur.com/y7uQO8M.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Retro 90s Anime Cel",
        description: "Bright, flat cel-shaded colors, crisp outlines, and nostalgic anime aesthetics from the late 1980s to 90s.",
        prompt: "A digital artwork in the style of a hand-painted 1990s anime production cel. Characters have crisp outlines and blocky, vibrant color fills. Backgrounds are painterly, soft, and pastel-toned. Compositions are cinematic, favoring dynamic medium shots and atmospheric establishing shots over static portraits. Subtle halation and dust or scan lines evoke authenticity. The mood is nostalgic and full of personality.",
        thumbnail: "https://i.imgur.com/JHprdNe.jpeg",
        category: "Modern & Graphic Styles"
    },
    {
        name: "French Art Brut (Outsider Art)",
        description: "Raw, expressive, often childlike imagery with bold, irregular marks and vivid color, inspired by Art Brut traditions.",
        prompt: "An image in the style of Art Brut (Outsider Art) as defined by Jean Dubuffet. Features rough, impulsive brushwork, irregular lines, and uninhibited use of color. Figures and shapes are naive or distorted, expressing emotion and individuality. The surface may include visible texture, collage, or mixed materials. Ensure expressive spontaneity and raw visual energy.",
        thumbnail: "https://i.imgur.com/wKcjbOd.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Acrylic Pour Abstract",
        description: "Mesmerizing swirls and cells created by pouring fluid acrylics, with vibrant marbled color blends.",
        prompt: "An abstract painting created by the acrylic pour technique. The composition is a swirl of vibrant, marbled colors with fluid gradients, lacing, and cell-like patterns forming from chemical interactions. The mood is organic, spontaneous, and hypnotic. Surface gloss and wet paint texture should be evident. Ensure richness of color and mesmerizing pattern complexity.",
        thumbnail: "https://i.imgur.com/N0rAF4G.jpeg",
        category: "Core Artistic Styles"
    },
    {
        name: "Contemporary Papercut Art",
        description: "Layered, hand-cut paper with sharp shadows and bold silhouettes, building a dimensional, modern composition.",
        prompt: "A contemporary papercut artwork with multiple layers of vividly colored or white paper, hand-cut into organic or geometric shapes. Each layer casts real shadows, creating depth and interplay of light. The style is modern, clean, and sculptural, with visible paper texture and occasional hand-cut imperfections. Ensure clarity, dimensionality, and graphic impact.",
        thumbnail: "https://i.imgur.com/fnvxTUU.png",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Renaissance Anatomical Drawing",
        description: "Scientific pen-and-ink or chalk anatomical drawing, in the tradition of Leonardo da Vinci, with handwritten notes.",
        prompt: "A Renaissance-style anatomical study, rendered in pen and ink or red chalk. Human bones, muscles, or organs are precisely drawn with meticulous linework and subtle hatching for volume. Handwritten Latin or Italian notes surround the image, with aged parchment texture and subtle stains. The style is scientific, precise, and historical.",
        thumbnail: "https://i.imgur.com/2tmv9yH.png",
        category: "Core Artistic Styles"
    },
    {
        name: "Mughal Miniature",
        description: "Luxurious, ornate painting style from Mughal India, with jewel-toned colors and elaborate border ornamentation.",
        prompt: "A Mughal miniature painting with jewel-like colors (emerald, sapphire, ruby, gold) on cream-colored paper. Depicts courtly scenes, gardens, or epic stories, with intricate floral borders and fine gold leaf detailing. Figures are highly stylized, faces and costumes rendered in delicate detail. Flat perspective and decorative harmony are key. Ensure opulent detail and historical authenticity.",
        thumbnail: "https://i.imgur.com/dKBFduL.png",
        category: "Historical & Cultural Styles"
    },
    {
        name: "Op Art Illusion",
        description: "Mind-bending optical patterns, geometric repetition, and visual illusions from the Op Art movement.",
        prompt: "An Op Art composition inspired by Bridget Riley or Victor Vasarely. Repeating geometric shapes, high-contrast black and white, or bold color gradients form dynamic visual illusions—vibration, movement, or warping. The style is mathematical, precise, and mesmerizing. Ensure clean edges, crisp contrast, and strong optical effects.",
        thumbnail: "https://i.imgur.com/LJTnBgc.jpeg",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Steampunk Engraving",
        description: "Victorian-era engraving with mechanical fantasy—gears, airships, and inventions drawn in meticulous crosshatch.",
        prompt: "A highly detailed black-and-white engraving in steampunk style. Features intricate Victorian mechanisms, gears, clockwork devices, steam engines, or fantastical airships. Drawn in dense cross-hatching and stippling, on aged paper with title banners. The mood is imaginative, technological, and retro-futuristic. Ensure linework precision and ornamental detail.",
        thumbnail: "https://i.imgur.com/4k4IjnV.jpeg",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Doodle Sketchbook Page",
        description: "Playful, spontaneous ink or pencil doodles, filling a notebook page with random characters, shapes, and ideas.",
        prompt: "A sketchbook page filled edge-to-edge with playful, spontaneous doodles and notes. Drawn in pen or pencil, the page overflows with random characters, faces, objects, creatures, abstract shapes, arrows, and scribbled ideas. Margins may contain quick notes, corrections, or coffee stains. The style is informal, lively, and creative. Ensure hand-drawn authenticity and visual variety.",
        thumbnail: "https://i.imgur.com/yQPZ0XB.jpeg",
        category: "Modern & Graphic Styles"
    },
    {
        name: "Chinese Landscape Ink Wash",
        description: "Soft, flowing ink landscapes with poetic, atmospheric mists and mountains. Evokes serenity and the power of nature.",
        prompt: "A Chinese ink wash landscape (shanshui), featuring misty mountains, rivers, distant peaks, and expressive brushstrokes. Ink tones vary from deep black to pale gray washes, on absorbent rice paper. Minimal color, but occasional red seal or subtle blossoms. Emphasize atmospheric depth, empty space, and natural harmony.",
        thumbnail: "https://i.imgur.com/G3fJdVL.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Gongbi Palace Lady Painting",
        description: "Meticulous, elegant Gongbi style with fine linework, soft colors, and graceful courtly women in flowing robes.",
        prompt: "A detailed Chinese Gongbi painting, featuring a full-figure or medium shot of an elegant lady of the palace in an ornate traditional setting. Fine, precise ink outlines and carefully shaded mineral pigments bring out delicate details in costume, hair, and ornament. Backgrounds often show flowering trees, screens, or silk, with a sense of stillness and refined beauty.",
        thumbnail: "https://i.imgur.com/pZJvQn0.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Dunhuang Buddhist Mural",
        description: "Ancient wall mural style from the Dunhuang caves, with spiritual figures, soft earth tones, and faded fresco textures.",
        prompt: "A Dunhuang cave mural, depicting Buddhist deities, apsaras (celestial musicians), and swirling scarves in floating poses. Painted in soft earth tones (ochres, greens, blues), with faded, weathered textures and cracks. Figures have round faces, delicate hands, and elaborate jewelry. The mood is sacred, spiritual, and timeless.",
        thumbnail: "https://i.imgur.com/83pL3fX.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Chinese Folk Narrative Painting",
        description: "Colorful, lively folk art depicting scenes of rural life, festivals, or legends with stylized figures and decorative patterns.",
        prompt: "A vibrant Chinese folk painting, showing village scenes, farmers, or celebrations. Figures are stylized and cheerful, often with bold outlines and flat, bright colors. Decorative patterns and repeating motifs fill the background. The mood is lively, joyful, and communal.",
        thumbnail: "https://i.imgur.com/y1vO9wS.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Qing Dynasty Figure Scroll",
        description: "Traditional figure painting with flowing garments, fine facial features, and harmonious, balanced compositions.",
        prompt: "A classical Qing dynasty scroll painting, showing a full or three-quarter view of a graceful noblewoman or scholar in finely detailed clothing within a minimalist, atmospheric setting. The scene features subtle color washes, expressive lines, and a balanced use of negative space. The background is plain or lightly decorated, emphasizing the elegance of posture and expression.",
        thumbnail: "https://i.imgur.com/R81LgQY.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Modern Xieyi (Freehand Brush) Style",
        description: "Expressive, spontaneous ink and color, minimal detail, and a focus on mood and spirit over realism.",
        prompt: "A modern Chinese xieyi (freehand brush) painting, with swift, expressive strokes and splashes of color. Subjects may include birds, flowers, or playful figures. The composition is loose and spontaneous, emphasizing the movement of the brush and capturing the spirit rather than precise detail.",
        thumbnail: "https://i.imgur.com/2Yc0l8Q.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Chinese Plum Blossom Brushwork",
        description: "Delicate, poetic ink and color painting of blooming plum branches, symbolizing resilience and beauty.",
        prompt: "A poetic Chinese brush painting of blooming plum blossoms. Stark, twisting black branches are painted with energetic, calligraphic brushwork, while the blossoms are rendered in vibrant red or pink, with soft color washes. The background is plain or subtly textured rice paper. The mood is serene and uplifting.",
        thumbnail: "https://i.imgur.com/9C07r4N.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Minimalist Chinese Landscape Sketch",
        description: "Sparse pencil or ink sketches with just a few strokes, evoking vast mountains and tranquil waters.",
        prompt: "A minimalist Chinese landscape sketch, drawn in pencil or ink with just a few simple, flowing lines to suggest mountains, water, and distant villages. A single red sun or moon may be included as a focal point. Emphasize empty space and tranquility.",
        thumbnail: "https://i.imgur.com/T5I0kfY.png",
        category: "Chinese Art Styles"
    },
    {
        name: "Ukiyo-e Kabuki Portrait",
        description: "Bold, expressive woodblock prints of kabuki actors, featuring dramatic poses, sharp outlines, and vibrant colors.",
        prompt: "A Japanese Ukiyo-e woodblock print depicting a kabuki actor in a dramatic 'mie' pose on stage, capturing the full costume and theatrical setting. The focus is on the drama of the performance, not a simple portrait. The subject is shown with exaggerated facial expressions, sharply outlined features, and stylized hair. The palette is vivid but flat, with patterned kimono designs and a simple background. Strong lines and theatrical energy define the style.",
        thumbnail: "https://i.imgur.com/h5T2YvM.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Modern Japanese Pop Ukiyo-e",
        description: "A fusion of traditional Ukiyo-e motifs with modern pop elements, graphic colors, and contemporary twists.",
        prompt: "A contemporary pop art illustration inspired by Ukiyo-e. Features a striking central figure, often full-body, integrated into a dynamic scene with modern and traditional elements. Bold outlines and motifs like cherry blossoms and great waves are rendered in flat, bright colors. Modern design elements or digital patterns may be integrated for a playful, eye-catching look.",
        thumbnail: "https://i.imgur.com/6U8sW3x.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Classic Ukiyo-e Landscape",
        description: "Elegant Edo period woodblock landscapes with harmonious composition, subtle gradients, and scenic Japanese views.",
        prompt: "A classical Ukiyo-e landscape in the style of Hokusai or Hiroshige. The scene features iconic Japanese scenery: Mount Fuji, cherry blossoms, rivers, or travelers. Gradual color transitions (bokashi), flat shapes, and delicate linework capture the beauty of nature and seasonal atmosphere.",
        thumbnail: "https://i.imgur.com/s65T1Xz.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Bijin-ga (Beautiful Woman Print)",
        description: "Graceful, refined portraits of elegant women in exquisite kimonos, often shown in poetic settings.",
        prompt: "A Japanese Bijin-ga print depicting a full-length or three-quarter view of a graceful woman in an exquisite kimono, often shown in a poetic setting like a garden or by a window. The lines are delicate, faces oval with calm expressions, and the pose is gentle and poised. Details like hairpins and fans are included. Backgrounds are minimal. The mood is contemplative and elegant.",
        thumbnail: "https://i.imgur.com/f9GqT8y.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Meiji-Era Narrative Scroll",
        description: "Long, horizontal compositions depicting daily life or historical scenes with fine linework and soft color washes.",
        prompt: "A Meiji-era Japanese narrative painting or emakimono (scroll), showing lively scenes of festivals, markets, or famous legends. Figures are arranged in sequential vignettes across a horizontal plane. The style features fine brush lines, pastel mineral pigments, and a harmonious balance between figures and nature.",
        thumbnail: "https://i.imgur.com/qLwR3gI.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Japanese Monster & Folklore Painting",
        description: "Fantastical paintings of yokai, oni, and legendary heroes, with vibrant mineral pigments and dynamic movement.",
        prompt: "A Japanese folklore painting showing a battle between a heroic figure and a monster (yokai or oni). Figures are expressive, with bold mineral pigments (ultramarine, vermilion, gold). Dramatic gestures and swirling garments enhance the sense of action. The background may feature stylized clouds, trees, or abstract textures.",
        thumbnail: "https://i.imgur.com/z4HqM6D.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Ukiyo-e Teahouse Scene",
        description: "Warm, detailed interior scenes showing elegant women or musicians in a teahouse, filled with patterns and daily life objects.",
        prompt: "A woodblock print in the Ukiyo-e style depicting an interior teahouse scene. Geishas or courtesans gather, playing music, serving tea, or conversing. Intricate kimono patterns, tatami mats, and screens fill the composition. The style is graceful, detailed, and intimate, capturing the beauty of Japanese daily life.",
        thumbnail: "https://i.imgur.com/o2xQ7Yk.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Kyo-ga (Kyoto School) Snow Scene",
        description: "Elegant indoor gathering in a Kyoto home, with delicate details, patterned fabrics, and snowy landscape seen through screens.",
        prompt: "A Kyoto School (Kyo-ga) scene featuring a group of figures enjoying winter indoors. Kimonos are decorated with seasonal patterns; sliding doors open to reveal snow-covered gardens. Fine lines, gold accents, and refined, muted colors dominate. The composition is harmonious and peaceful.",
        thumbnail: "https://i.imgur.com/mYgBwN9.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Early Ukiyo-e Tan-e (Red Print)",
        description: "Early woodblock prints using earthy tones and hand-applied red pigment, with calligraphy and narrative scenes.",
        prompt: "An early Ukiyo-e Tan-e print, with limited color—mainly earthy browns, yellows, and hand-painted red. Figures are outlined with calligraphic brush lines, and the scene may include poetry or dialogue in elegant script. Surfaces show texture from aged paper and traditional pigments.",
        thumbnail: "https://i.imgur.com/L4y9a9f.png",
        category: "Japanese Art Styles"
    },
    {
        name: "Graffiti Over an Old Mural",
        description: "Bright, modern graffiti partially covers a faded mural, creating a layered, chaotic blend of eras and stories.",
        prompt: "A wide-angle urban wall: an old, faded mural—once vibrant—is partially covered by modern graffiti tags and spray paint. New art competes with old, colors and images overlapping, as the passage of time creates a living collage.",
        thumbnail: "https://i.imgur.com/VuS3BO7.png",
        category: "Aged & Textured Styles"
    }
];