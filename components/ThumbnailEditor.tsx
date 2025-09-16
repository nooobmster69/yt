import React from 'react';
import type { CanvasElement } from '../types';
import { AddObjectIcon } from './icons';

type InteractionType = 'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl' | 'resize-t' | 'resize-b' | 'resize-l' | 'resize-r' | 'rotate';

type Interaction = {
    type: InteractionType;
    elementId: string;
    // Mouse start positions
    startX: number;
    startY: number;
    // Element's initial state
    elementStartX: number;
    elementStartY: number;
    elementStartWidth: number;
    elementStartHeight: number;
    elementStartRotation: number;
    // Center of the element for rotation calculation
    centerX: number;
    centerY: number;
} | null;

const generate3dTextShadow = (depth: number, angle: number, color: string): string => {
    if (depth <= 0) return '';
    const angleRad = angle * (Math.PI / 180);
    const offsetX = Math.cos(angleRad);
    const offsetY = Math.sin(angleRad);
    let shadow = '';
    for (let i = 1; i <= depth; i++) {
        shadow += `${offsetX * i}px ${offsetY * i}px 0 ${color}${i === depth ? '' : ', '}`;
    }
    return shadow;
};


const DraggableResizableElement = ({
    element,
    onUpdate,
    onSelect,
    onInteractionStart,
    isSelected,
    editingElementId,
    setEditingElementId
}: {
    element: CanvasElement;
    onUpdate: (id: string, props: Partial<CanvasElement>) => void;
    onSelect: (id: string | null) => void;
    onInteractionStart: (e: React.MouseEvent, type: InteractionType, element: CanvasElement) => void;
    isSelected: boolean;
    editingElementId: string | null;
    setEditingElementId: (id: string | null) => void;
}) => {
    const isEditing = element.type === 'text' && editingElementId === element.id;
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const resizeHandles: { cursor: string, type: InteractionType, position: string }[] = [
        { cursor: 'nwse-resize', type: 'resize-tl', position: 'top-0 left-0' },
        { cursor: 'nesw-resize', type: 'resize-tr', position: 'top-0 right-0' },
        { cursor: 'nesw-resize', type: 'resize-bl', position: 'bottom-0 left-0' },
        { cursor: 'nwse-resize', type: 'resize-br', position: 'bottom-0 right-0' },
        { cursor: 'ns-resize', type: 'resize-t', position: 'top-0 left-1/2 -translate-x-1/2' },
        { cursor: 'ns-resize', type: 'resize-b', position: 'bottom-0 left-1/2 -translate-x-1/2' },
        { cursor: 'ew-resize', type: 'resize-l', position: 'top-1/2 left-0 -translate-y-1/2' },
        { cursor: 'ew-resize', type: 'resize-r', position: 'top-1/2 right-0 -translate-y-1/2' },
    ];

    const elementStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        cursor: isEditing ? 'default' : 'move',
        userSelect: 'none',
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
    };
    
    const contentStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        pointerEvents: 'none',
        fontFamily: element.fontFamily || 'Impact',
        fontWeight: element.fontWeight || 900,
        fontStyle: element.fontStyle || 'normal',
        fontSize: `${element.fontSize}px`,
        textAlign: element.textAlign || 'center',
        lineHeight: element.lineHeight || 1.2,
        padding: '2px',
    };

    const textShadows: string[] = [];
    
    if (element.type === 'text') {
        if (element.useGradient) {
            contentStyle.background = `linear-gradient(${element.gradientAngle}deg, ${element.gradientColor1}, ${element.gradientColor2})`;
            contentStyle.WebkitBackgroundClip = 'text';
            contentStyle.backgroundClip = 'text';
            contentStyle.color = 'transparent';
        } else {
            contentStyle.color = element.color || '#FFFFFF';
        }

        if (element.shadowBlur > 0 && element.shadowColor) {
            textShadows.push(`${element.shadowOffsetX}px ${element.shadowOffsetY}px ${element.shadowBlur}px ${element.shadowColor}`);
        }
        if (element.use3dEffect) {
            const shadow3d = generate3dTextShadow(element.depth3d, element.angle3d, element.color3d);
            if (shadow3d) textShadows.push(shadow3d);
        }
        if (textShadows.length > 0) contentStyle.textShadow = textShadows.join(', ');
        if (element.strokeWidth > 0 && element.strokeColor) contentStyle.WebkitTextStroke = `${element.strokeWidth}px ${element.strokeColor}`;
    }

    const objectStyle: React.CSSProperties = {};
    if (element.type === 'object') {
        objectStyle.backgroundColor = element.backgroundColor;
        objectStyle.borderColor = element.borderColor;
        objectStyle.borderWidth = `${element.borderWidth}px`;
        objectStyle.borderStyle = 'dashed';
    }
    
    return (
        <div
            style={elementStyle}
            className={`group absolute transition-shadow duration-200 ${isSelected ? 'shadow-2xl' : ''}`}
            onMouseDown={(e) => {
                if (isEditing) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect(element.id);
                onInteractionStart(e, 'move', element);
            }}
            onDoubleClick={(e) => {
                if (element.type === 'text') {
                    e.stopPropagation();
                    onSelect(element.id);
                    setEditingElementId(element.id);
                }
            }}
        >
            <div className={`w-full h-full border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'} p-1 rounded-sm`}>
                 <div
                    style={element.type === 'object' ? objectStyle : { borderStyle: 'dashed', borderColor: isSelected ? 'transparent' : 'rgba(156, 163, 175, 0.5)' }}
                    className={`w-full h-full flex items-center justify-center rounded-sm transition-colors duration-200`}
                >
                    {isEditing ? (
                        <textarea
                            ref={textareaRef}
                            value={element.content}
                            onChange={(e) => onUpdate(element.id, { content: e.target.value })}
                            onBlur={() => setEditingElementId(null)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
                                    e.preventDefault();
                                    setEditingElementId(null);
                                    e.currentTarget.blur();
                                }
                            }}
                            className="w-full h-full text-center border-none outline-none p-0 m-0 resize-none"
                            style={{
                                ...contentStyle,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                color: '#111827',
                                // Reset shadows and stroke for editing clarity
                                textShadow: 'none',
                                WebkitTextStroke: 'none',
                                background: 'none',
                                WebkitBackgroundClip: 'unset',
                                backgroundClip: 'unset',
                            }}
                            onMouseDown={e => e.stopPropagation()}
                        />
                    ) : (
                        <div style={contentStyle} className="font-bold break-all text-center">
                            {element.type === 'object' && <AddObjectIcon className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400 opacity-50" />}
                            {element.type === 'text' && element.content}
                        </div>
                    )}
                </div>
            </div>
            {isSelected && !isEditing && (
                <>
                    {resizeHandles.map(handle => {
                        return (
                            <div
                                key={handle.type}
                                style={{ cursor: handle.cursor }}
                                className={`absolute w-3 h-3 bg-blue-500 border border-white dark:border-gray-900 rounded-full z-10 ${handle.position}`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onInteractionStart(e, handle.type, element);
                                }}
                            />
                         )
                    })}
                    <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white dark:border-gray-900 rounded-full z-10 cursor-alias"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onInteractionStart(e, 'rotate', element);
                        }}
                    >
                         <div className="absolute bottom-full left-1/2 w-px h-3 bg-blue-500" />
                    </div>
                </>
            )}
        </div>
    );
};


export const ThumbnailEditor = ({
    elements,
    selectedElementId,
    onSelect,
    onUpdate,
    editingElementId,
    setEditingElementId
}: {
    elements: CanvasElement[];
    selectedElementId: string | null;
    onSelect: (id: string | null) => void;
    onUpdate: (id: string, props: Partial<CanvasElement>) => void;
    editingElementId: string | null;
    setEditingElementId: (id: string | null) => void;
}) => {
    const canvasRef = React.useRef<HTMLDivElement>(null);
    const interactionRef = React.useRef<Interaction>(null);

    const handleInteractionStart = React.useCallback((e: React.MouseEvent, type: InteractionType, element: CanvasElement) => {
        if (!canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        const elementRect = {
            x: (element.x / 100) * canvasRect.width,
            y: (element.y / 100) * canvasRect.height,
            width: (element.width / 100) * canvasRect.width,
            height: (element.height / 100) * canvasRect.height,
        };

        interactionRef.current = {
            type,
            elementId: element.id,
            startX: e.clientX,
            startY: e.clientY,
            elementStartX: elementRect.x,
            elementStartY: elementRect.y,
            elementStartWidth: elementRect.width,
            elementStartHeight: elementRect.height,
            elementStartRotation: element.rotation,
            centerX: elementRect.x + elementRect.width / 2,
            centerY: elementRect.y + elementRect.height / 2,
        };
    }, []);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!interactionRef.current || !canvasRef.current) return;
            const interaction = interactionRef.current;
            const canvasRect = canvasRef.current.getBoundingClientRect();
            
            const dx = e.clientX - interaction.startX;
            const dy = e.clientY - interaction.startY;
            
            let newProps: Partial<CanvasElement> = {};

            if (interaction.type === 'move') {
                const newX = interaction.elementStartX + dx;
                const newY = interaction.elementStartY + dy;
                newProps.x = Math.max(0, Math.min(100 - (interaction.elementStartWidth / canvasRect.width * 100), newX / canvasRect.width * 100));
                newProps.y = Math.max(0, Math.min(100 - (interaction.elementStartHeight / canvasRect.height * 100), newY / canvasRect.height * 100));
            } else if (interaction.type === 'rotate') {
                const angle = Math.atan2(e.clientY - (canvasRect.top + interaction.centerY), e.clientX - (canvasRect.left + interaction.centerX)) * (180 / Math.PI);
                newProps.rotation = Math.round(angle + 90);
            } else { // Resizing
                let newWidth = interaction.elementStartWidth, newHeight = interaction.elementStartHeight, newX = interaction.elementStartX, newY = interaction.elementStartY;
                if (interaction.type.includes('r')) newWidth = interaction.elementStartWidth + dx;
                if (interaction.type.includes('l')) { newWidth = interaction.elementStartWidth - dx; newX = interaction.elementStartX + dx; }
                if (interaction.type.includes('b')) newHeight = interaction.elementStartHeight + dy;
                if (interaction.type.includes('t')) { newHeight = interaction.elementStartHeight - dy; newY = interaction.elementStartY + dy; }
                
                if (newWidth > 10) { newProps.width = newWidth / canvasRect.width * 100; newProps.x = newX / canvasRect.width * 100; }
                if (newHeight > 10) { newProps.height = newHeight / canvasRect.height * 100; newProps.y = newY / canvasRect.height * 100; }
            }
            onUpdate(interaction.elementId, newProps);
        };

        const handleMouseUp = () => { interactionRef.current = null; };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onUpdate]);

    const sortedElements = React.useMemo(() => elements.slice().sort((a,b) => a.zIndex - b.zIndex), [elements]);
    
    return (
        <div ref={canvasRef} onMouseDown={() => { onSelect(null); setEditingElementId(null); }} className="w-full bg-gray-200 dark:bg-gray-800 rounded-lg relative overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
            {sortedElements.map(el => (
                <DraggableResizableElement
                    key={el.id}
                    element={el}
                    onUpdate={onUpdate}
                    onSelect={onSelect}
                    onInteractionStart={handleInteractionStart}
                    isSelected={selectedElementId === el.id}
                    editingElementId={editingElementId}
                    setEditingElementId={setEditingElementId}
                />
            ))}
        </div>
    );
};