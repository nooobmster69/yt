import React from 'react';
import { SparklesIcon, ArrowUturnLeftIcon, SaveIcon, PaintBrushIcon } from './icons';
import { Loader } from './Loader';
import { ImageGenerationState, ImageGenerationAttempt } from '../types';
import { CopyButton } from './CopyButton';
import { ImagePreviewModal } from './ImagePreviewModal';

interface ImageGeneratorProps {
    prompt: string;
    imageState?: ImageGenerationState;
    onGenerate: (prompt: string) => void;
    onAdjustImage: (chainKey: string, imageToAdjust: ImageGenerationAttempt, adjustmentText: string) => void;
}

export const ImageGenerator = ({ prompt, imageState, onGenerate, onAdjustImage }: ImageGeneratorProps) => {
    const status = imageState?.status || 'idle';
    const images = imageState?.images || [];
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [isAdjusting, setIsAdjusting] = React.useState(false);
    const [adjustmentText, setAdjustmentText] = React.useState('');
    const prevImagesLengthRef = React.useRef(images.length);


    // Auto-select the latest image when a new one is added
    React.useEffect(() => {
        const prevLength = prevImagesLengthRef.current;
        const currentLength = images.length;

        if (currentLength > prevLength) {
            setSelectedIndex(currentLength - 1);
        } else if (currentLength > 0 && selectedIndex >= currentLength) {
            setSelectedIndex(currentLength - 1);
        } else if (currentLength === 0) {
            setSelectedIndex(-1);
        }

        prevImagesLengthRef.current = currentLength;
    }, [images, selectedIndex]);

    const selectedImage = images.length > 0 && selectedIndex !== -1 ? images[selectedIndex] : null;

    const renderMainPreview = () => {
        if (status === 'loading' && images.length === 0) {
            return <div className="flex items-center justify-center h-full"><Loader message="Generating image..." subMessage="This can take a moment." /></div>;
        }
        if (status === 'error' && !selectedImage) {
            return (
                 <div className="flex items-center justify-center h-full p-4">
                    <div className="text-center text-red-700 dark:text-red-400 p-2 animate-fade-in bg-red-100 dark:bg-red-900/30 rounded-lg text-sm">
                        <p>Image generation failed: {imageState?.error}</p>
                    </div>
                 </div>
            );
        }
        if (selectedImage) {
            return (
                <div className="relative group w-full h-full bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {status === 'loading' && imageState?.isAdjusting && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Loader message="Adjusting image..." subMessage="The AI is revising your masterpiece." />
                        </div>
                    )}
                    <img 
                        src={`data:image/png;base64,${selectedImage.data}`} 
                        alt="Generated image" 
                        className="w-full h-full object-contain cursor-pointer" 
                        onClick={() => setIsPreviewOpen(true)}
                    />
                     <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {selectedImage.model}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-500">Generate an image to see it here.</p>
            </div>
        );
    };
    
    const handleAdjustSubmit = () => {
        if (!adjustmentText.trim() || !selectedImage) return;
        onAdjustImage(prompt, selectedImage, adjustmentText);
        setIsAdjusting(false);
        setAdjustmentText('');
    };

    return (
        <div className="mt-4 p-4 bg-gray-200/50 dark:bg-gray-800/30 rounded-lg">
            {images.length > 0 || status === 'loading' || (status === 'error' && images.length === 0) ? (
                <div className="flex flex-col gap-2">
                    <div className="flex-grow w-full aspect-video min-h-0">
                        {renderMainPreview()}
                    </div>
                    {images.length > 1 && (
                         <div className="w-full flex-shrink-0">
                            <div className="flex gap-2 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                                {images.map((img, index) => {
                                    const isAdjusted = img.prompt && images.length > 0 && images[0].prompt && img.prompt !== images[0].prompt;
                                    return (
                                        <button 
                                            key={img.id}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`relative h-20 aspect-[16/9] flex-shrink-0 rounded-md overflow-hidden ring-2 transition-all duration-200 ${selectedIndex === index ? 'ring-purple-500 ring-offset-2 ring-offset-gray-200/50 dark:ring-offset-gray-800/30' : 'ring-transparent hover:ring-purple-400'}`}
                                            title={isAdjusted ? `Adjusted Version - Click to view` : `Original Version`}
                                        >
                                            <img src={`data:image/png;base64,${img.data}`} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                                            {isAdjusted && <div className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-yellow-300"><SparklesIcon className="w-3 h-3"/></div>}
                                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] font-semibold px-1 py-0 rounded backdrop-blur-sm">
                                                {img.model.replace('imagen-3.0-', '').replace('-preview-06-06', '').replace('generate-', '')}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            {selectedImage && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prompt for Selected Image</h4>
                    <div className="relative">
                        <pre className="text-xs p-3 pr-12 bg-gray-100 dark:bg-black/40 rounded-md max-h-40 overflow-y-auto font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                            {selectedImage.prompt}
                        </pre>
                        <CopyButton textToCopy={selectedImage.prompt} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20" />
                    </div>
                </div>
            )}
            
            <div className="flex items-center justify-center gap-4 mt-4">
                <button 
                    onClick={() => onGenerate(prompt)}
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200/50 dark:focus:ring-offset-gray-800/30 focus:ring-purple-500 transition-all disabled:opacity-50"
                >
                    {status === 'loading' && !imageState?.isAdjusting
                        ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                        : images.length > 0 
                            ? <ArrowUturnLeftIcon className="w-5 h-5" />
                            : <SparklesIcon className="w-5 h-5" />
                    }
                    <span>{status === 'loading' && !imageState?.isAdjusting ? 'Generating...' : (images.length > 0 ? 'Generate New' : 'Generate Image')}</span>
                </button>

                {selectedImage && (
                    <>
                        <button 
                            onClick={() => setIsAdjusting(true)}
                            disabled={status === 'loading'}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-300 dark:bg-gray-700/50 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200/50 dark:focus:ring-offset-gray-800/30 focus:ring-purple-500 transition-all disabled:opacity-50"
                        >
                            <PaintBrushIcon className="w-5 h-5" />
                            <span>Adjust with AI</span>
                        </button>
                        <a 
                            href={`data:image/png;base64,${selectedImage.data}`}
                            download={`generated_image_${selectedImage.id}.png`}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-300 dark:bg-gray-700/50 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200/50 dark:focus:ring-offset-gray-800/30 focus:ring-purple-500 transition-all"
                        >
                            <SaveIcon className="w-5 h-5" />
                            <span>Download</span>
                        </a>
                    </>
                )}
            </div>

            {isAdjusting && selectedImage && (
                <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg space-y-2 animate-fade-in border border-purple-200 dark:border-purple-800/50">
                    <label htmlFor="adjustment-text" className="text-sm font-semibold text-purple-800 dark:text-purple-200">Describe your adjustment to the selected image:</label>
                    <textarea
                        id="adjustment-text"
                        value={adjustmentText}
                        onChange={(e) => setAdjustmentText(e.target.value)}
                        placeholder="e.g., make the robot blue, add sunglasses, change style to watercolor"
                        className="w-full p-2 text-sm rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-purple-500"
                        rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsAdjusting(false)} className="px-3 py-1.5 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                        <button 
                            onClick={handleAdjustSubmit} 
                            disabled={!adjustmentText.trim() || status === 'loading'}
                            className="px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            Generate Adjustment
                        </button>
                    </div>
                </div>
            )}
            {isPreviewOpen && selectedImage && <ImagePreviewModal image={selectedImage} onClose={() => setIsPreviewOpen(false)} />}
        </div>
    );
};
