import React from 'react';
import type { ImageGenerationState, ImageGenerationAttempt } from '../types';
import { CloseIcon, PhotoIcon, SparklesIcon, SaveIcon, ArrowsPointingOutIcon } from './icons';
import { ImagePreviewModal } from './ImagePreviewModal';
import { CopyButton } from './CopyButton';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedImages: Record<string, ImageGenerationState>;
}

interface ImageGroup {
    title: string;
    images: ImageGenerationAttempt[];
}

// Main Component
export const ImageGalleryModal = ({ isOpen, onClose, generatedImages }: ImageGalleryModalProps) => {
    const imageGroups = React.useMemo<ImageGroup[]>(() => {
        const groups: Record<string, ImageGroup> = {};

        Object.entries(generatedImages)
            .filter(([, state]) => state.images && state.images.length > 0)
            .forEach(([key, state]) => {
                const title = state.title || key; // Fallback for safety, though sanitizeProjectData should handle this
                if (!groups[title]) {
                    groups[title] = {
                        title: title,
                        images: [],
                    };
                }
                groups[title].images.push(...state.images);
            });

        return Object.values(groups).map(group => {
            // Sort images to cluster adjustments with their originals
            const sortedImages = [...group.images].sort((a, b) => {
                // Primary sort: by prompt string to group adjustments together
                if (a.prompt < b.prompt) return -1;
                if (a.prompt > b.prompt) return 1;
                // Secondary sort: by ID (timestamp) to order adjustments chronologically
                return parseInt(a.id) - parseInt(b.id);
            });
            return { ...group, images: sortedImages };
        }).sort((a, b) => a.title.localeCompare(b.title));
    }, [generatedImages]);

    const [selectedGroupKey, setSelectedGroupKey] = React.useState<string | null>(null);
    const [selectedImageId, setSelectedImageId] = React.useState<string | null>(null);
    const [previewImage, setPreviewImage] = React.useState<ImageGenerationAttempt | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            if (imageGroups.length > 0) {
                const firstGroup = imageGroups[0];
                setSelectedGroupKey(firstGroup.title);
                if (firstGroup.images.length > 0) {
                    // Select the latest image overall in the group by sorting by ID (timestamp)
                    const latestImage = [...firstGroup.images].sort((a, b) => parseInt(b.id) - parseInt(a.id))[0];
                    setSelectedImageId(latestImage.id);
                }
            } else {
                setSelectedGroupKey(null);
                setSelectedImageId(null);
            }
        }
    }, [isOpen, imageGroups]);

    const selectedGroup = React.useMemo(() => 
        selectedGroupKey ? imageGroups.find(g => g.title === selectedGroupKey) : null,
        [selectedGroupKey, imageGroups]
    );

    const selectedImage = React.useMemo(() => 
        selectedGroup ? selectedGroup.images.find(img => img.id === selectedImageId) : null,
        [selectedGroup, selectedImageId]
    );

    const handleSelectGroup = (groupTitle: string) => {
        setSelectedGroupKey(groupTitle);
        const group = imageGroups.find(g => g.title === groupTitle);
        if (group && group.images.length > 0) {
            const latestImage = [...group.images].sort((a, b) => parseInt(b.id) - parseInt(a.id))[0];
            setSelectedImageId(latestImage.id);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="gallery-modal-title"
            >
                <div 
                    className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <PhotoIcon className="w-7 h-7 text-purple-500"/>
                            <h2 id="gallery-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Image Asset Gallery</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                            aria-label="Close modal"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <main className="flex-1 grid grid-cols-1 md:grid-cols-4 min-h-0">
                        {/* Left Panel: Group List */}
                        <aside className="col-span-1 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                             {imageGroups.length > 0 ? (
                                <nav className="p-2 space-y-1">
                                    {imageGroups.map(group => {
                                        const latestImageInGroup = [...group.images].sort((a,b) => parseInt(b.id) - parseInt(a.id))[0];
                                        const isSelected = selectedGroupKey === group.title;
                                        return (
                                            <button 
                                                key={group.title} 
                                                onClick={() => handleSelectGroup(group.title)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${isSelected ? 'bg-purple-100 dark:bg-purple-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                            >
                                                <img src={`data:image/png;base64,${latestImageInGroup.data}`} alt={group.title} className="w-16 h-10 object-cover rounded-md flex-shrink-0 bg-gray-300"/>
                                                <div className="flex-grow min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-purple-800 dark:text-purple-200' : 'text-gray-800 dark:text-gray-200'}`}>{group.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.images.length} image{group.images.length > 1 ? 's' : ''}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </nav>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                                    <PhotoIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">No Images Yet</h3>
                                    <p className="mt-1 text-sm">Generate images to see them here.</p>
                                </div>
                            )}
                        </aside>

                        {/* Right Panel: Detail View */}
                        <div className="col-span-3 p-4 md:p-6 flex flex-col bg-gray-100 dark:bg-gray-800/20 min-h-0">
                            {selectedGroup && selectedImage ? (
                                <>
                                    <div className="flex-grow w-full bg-black/20 rounded-xl relative flex items-center justify-center min-h-0">
                                        <img 
                                            src={`data:image/png;base64,${selectedImage.data}`}
                                            alt={selectedImage.prompt}
                                            className="max-w-full max-h-full object-contain rounded-lg"
                                        />
                                        <button onClick={() => setPreviewImage(selectedImage)} className="absolute top-3 right-3 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-sm" title="Fullscreen">
                                            <ArrowsPointingOutIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <div className="flex-shrink-0 pt-4 space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Prompt for this version:</h4>
                                                {selectedImage.model && (
                                                    <span className="px-2 py-0.5 text-xs font-bold text-cyan-700 bg-cyan-100 dark:text-cyan-200 dark:bg-cyan-600/30 rounded-full flex-shrink-0">{selectedImage.model}</span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <pre className="text-xs p-3 pr-12 bg-gray-200 dark:bg-gray-900/50 rounded-lg max-h-24 overflow-y-auto font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{selectedImage.prompt}</pre>
                                                <CopyButton textToCopy={selectedImage.prompt} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Filmstrip */}
                                            <div className="flex-grow flex gap-2 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                                                {selectedGroup.images.map((image, index) => {
                                                    const isSelected = selectedImageId === image.id;
                                                    const isAdjusted = index > 0 && image.prompt === selectedGroup.images[index - 1].prompt;
                                                    return (
                                                         <button 
                                                            key={image.id}
                                                            onClick={() => setSelectedImageId(image.id)}
                                                            className={`relative h-20 aspect-[16/9] flex-shrink-0 rounded-md overflow-hidden ring-2 transition-all duration-200 ${isSelected ? 'ring-purple-500 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800/20' : 'ring-transparent hover:ring-purple-400'}`}
                                                        >
                                                            <img src={`data:image/png;base64,${image.data}`} alt={`Version ${index + 1}`} className="w-full h-full object-cover"/>
                                                            {isAdjusted && <div className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-yellow-300" title="AI Adjusted Version"><SparklesIcon className="w-3 h-3"/></div>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {/* Download Button */}
                                            <a 
                                                href={`data:image/png;base64,${selectedImage.data}`}
                                                download={`${selectedGroup.title?.replace(/[^a-z0-9]/gi, '_')}_${selectedImage.id}.png`}
                                                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-300 dark:bg-gray-700/50 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600/50"
                                            >
                                                <SaveIcon className="w-5 h-5" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                </>
                            ) : !selectedGroup && imageGroups.length > 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                                    <p>Select an image group from the left to view details.</p>
                                </div>
                            ) : null}
                        </div>
                    </main>
                </div>
            </div>
            {previewImage && <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />}
        </>
    );
};