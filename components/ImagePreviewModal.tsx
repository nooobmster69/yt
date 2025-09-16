import React from 'react';
import type { ImageGenerationAttempt } from '../types';
import { CloseIcon } from './icons';
import { CopyButton } from './CopyButton';

export const ImagePreviewModal = ({ image, onClose }: { image: ImageGenerationAttempt, onClose: () => void }) => {
    const [transform, setTransform] = React.useState({ scale: 1, x: 0, y: 0 });
    const isDraggingRef = React.useRef(false);
    const lastPosRef = React.useRef({ x: 0, y: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);
    const imgRef = React.useRef<HTMLImageElement>(null);

    const handleWheel = React.useCallback((e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        setTransform(prev => {
            const newScale = e.deltaY > 0 ? prev.scale / zoomFactor : prev.scale * zoomFactor;
            const clampedScale = Math.max(1, Math.min(newScale, 10));

            if (clampedScale === 1) {
                return { scale: 1, x: 0, y: 0 };
            }
            return { ...prev, scale: clampedScale };
        });
    }, []);

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        if (transform.scale > 1) {
            e.preventDefault();
            e.stopPropagation();
            isDraggingRef.current = true;
            lastPosRef.current = { x: e.clientX, y: e.clientY };
            if (imgRef.current) imgRef.current.style.cursor = 'grabbing';
        }
    }, [transform.scale]);
    
    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current || transform.scale <= 1) return;
        
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;

        setTransform(prev => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
        }));
        
        lastPosRef.current = { x: e.clientX, y: e.clientY };
    }, [transform.scale]);

    const handleMouseUp = React.useCallback(() => {
        isDraggingRef.current = false;
        if (imgRef.current) imgRef.current.style.cursor = 'grab';
    }, []);

    const resetZoom = () => {
        setTransform({ scale: 1, x: 0, y: 0 });
    };

    React.useEffect(() => {
        const container = containerRef.current;
        container?.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            container?.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleWheel, handleMouseMove, handleMouseUp]);


    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                Model: {image.model}
            </div>
            <div className="flex-grow w-full flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                <img 
                    ref={imgRef}
                    src={`data:image/png;base64,${image.data}`} 
                    alt="Enlarged preview" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-100"
                    style={{ 
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        cursor: transform.scale > 1 ? 'grab' : 'default' 
                    }}
                    onMouseDown={handleMouseDown}
                    onClick={e => e.stopPropagation()}
                />
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 flex flex-col items-center gap-2">
                 <div className="relative w-full bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm max-h-28 overflow-y-auto">
                     <p className="font-mono text-sm whitespace-pre-wrap break-words">{image.prompt}</p>
                     <CopyButton textToCopy={image.prompt} className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/20 hover:bg-white/30" />
                </div>
                <div className="flex items-center gap-2 bg-gray-900/50 text-white p-2 rounded-full backdrop-blur-sm">
                    <button onClick={resetZoom} className="px-3 py-1 text-sm hover:bg-white/20 rounded-full">Reset Zoom</button>
                    <span className="text-sm font-semibold w-16 text-center">{Math.round(transform.scale * 100)}%</span>
                </div>
            </div>

             <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-1.5 bg-gray-800/50 text-white rounded-full hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close preview"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
    );
};
